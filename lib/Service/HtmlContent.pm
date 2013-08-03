package Service::HtmlContent;
use strict;

sub new
{
    my $proto = shift;                 # извлекаем имя класса или указатель на объект
    my $class = ref($proto) || $proto; # если указатель, то взять из него имя класса
    my $self  = {};
    my %params = @_;                   # приём данных из new(param=>value)
    foreach (keys %params){
        $self->{$_} = $params{$_};
    }
    bless($self, $class);              # гибкий вызов функции bless
    return $self;
}

sub getContentForPage
{
	my ($self, $page, $lang) = @_;
	$lang = $lang || $self->{'lang'};
	$page = $page || $self->{'page'};
	my @contents = $self->{'dao'}->find({
		page => $page,
		lang => $lang
	});
	my $result = {};
	foreach my $content (@contents)
	{
		my $code = $content->getCode();
		$result->{$code} = $content->getContent();
	}
	return $result;
}

sub getContent
{
    my ( $self, $code ) = @_;
    my $content = $self->{'dao'}->find({
        page => $self->{'page'},
        lang => $self->{'lang'},
        code => $code
    });
    if($content)
    {
        return $content->getContent();
    }
}


1;