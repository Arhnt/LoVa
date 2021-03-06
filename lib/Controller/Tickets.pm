package Controller::Tickets;
use strict;
use lib "..";
use parent 'Controller::Abstract';

use JSON;
use Log::Log4perl;

require DAO::Ticket;

my $log = Log::Log4perl->get_logger("Controller::Tickets");
my $ticketDao = new DAO::Ticket();

sub getName { return 'Controller::Tickets' };

sub getLinks
{
	my $self = shift;
    return {
        'tickets' => {
            'list' => sub { $self->list( @_ ) },
            'add' => sub { $self->addTicket( @_ ) },
            'delete' => sub { $self->delete( @_ ) },
            'pay' => sub { $self->pay( @_ ) }       
        },
    }
}

# List all Tickets for Tickets store
sub list
{
    my($self, $url, $params) = @_;
    my $response->{'success'} = JSON::true;
    $response->{'total'} = $ticketDao->countExtJs($params);
    my @objects = $ticketDao->findExtJs($params);
    foreach my $obj (@objects)
    {
        my $jsonObj = $obj->getData();
        $jsonObj->{'total'} = $obj->getGames() * $obj->getGamePrice();
        push(@{$response->{data}}, $jsonObj);
    }
    
    return { type => 'ajax', data => $response };
}

sub addTicket
{
    my($self, $url, $params) = @_;
    my $response = { 'type' => 'redirect', 'data' => '/cab/' };
    my $user = $::userService->getCurrentUser();
    return $response unless($user);

    # Do not add tickets if game limit reached    
    my @activeTickets = $ticketDao->findActive($user->getId());
    my @notPaidTickets = $ticketDao->findNotPaid($user->getId());    
    my $ticketsCount = scalar @activeTickets + scalar @notPaidTickets;
    return $response if ($::optionsService->get('ticketsLimit') && ( $ticketsCount >= $::optionsService->get('ticketsLimit') ));        
        
 	my @numbers = split(",", $params->{'selected_lottery_numbers'});
	my $games = $params->{'games_count'};
	my $lovaNumber = $params->{'lova_number'};
	if(@numbers && $games && $lovaNumber)
	{
		$::ticketService->addTicket({userId => $user->getId(), games => $games, numbers => \@numbers, lovaNumber => $lovaNumber});
	}
	return $response;
}

sub delete
{
    my($self, $url, $params) = @_;
    my $response = { 'type' => 'redirect', 'data' => '/cab/' };
    my $user = $::userService->getCurrentUser();
    return $response unless($user);
    
    my $userId = $user->getId();
    my @tickets = map { &Data::Ticket::_decodeId($params->{$_}, $userId) } 
                  grep { /ticket/ }
                  keys %$params;

    $log->info("User <", $userId, "> trying to remove ", scalar @tickets, " tickets.");
    $log->debug("Tickets #: ", join(", ", @tickets));

    my $removed = 0;
    foreach my $id (@tickets) {
    	my $ticket = $ticketDao->findById($id);
    	if($ticket && ($ticket->getUserId() == $user->getId())) {
    		$ticketDao->delete($ticket);
    		$removed++;
    	}
    }
    $log->info("Removed $removed tickets by user <", $userId, ">.");
        
    return $response;
}

sub pay
{
    my($self, $url, $params) = @_;
    my $user = $::userService->getCurrentUser();
    return unless($user);
    
    my $response = { success => JSON::false, message => "Ошбика обработки." };
    
    if (not $params->{'selectedAccounts'} =~ /acc/ )
    {
    	$response->{'message'} = "Выберите счет для оплаты."; 
    	return { 'type' => 'ajax', 'data' => $response};
    }
    
    my @accounts = map { lc }
                   map { $_ =~ s/acc//; $_ }
                   grep { /^[a-z]+$/i }
                   grep { /acc/ }
                   split(",", $params->{'selectedAccounts'});

    if (! @accounts )
    {
        $response->{'message'} = "Выберите счет для оплаты."; 
        return { 'type' => 'ajax', 'data' => $response};
    }

    eval { $::ticketService->pay(@accounts); };
    if($@)
    {
        $response->{'message'} = $@;
        $response->{'message'} =~ s/\sat\s.+//;
        return { 'type' => 'ajax', 'data' => $response};
    }
    
    $response->{'success'} = JSON::true;
    $response->{'message'} = "Оплата произведена успешно.";
    return { 'type' => 'ajax', 'data' => $response};
}

1;
