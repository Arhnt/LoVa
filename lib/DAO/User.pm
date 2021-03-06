package DAO::User;
use strict;
use lib "..";
use parent 'DAO::Abstract';

use Log::Log4perl;

my $log = Log::Log4perl->get_logger("DAO::User");

sub getTable { return "users"; }
sub getModel { return "Data::User"; }

sub findByLogin
{
    my ($self, $login) = @_;
    return $self->find({ login => $login });
}

sub findByEmail
{
    my ($self, $email) = @_;
    return $self->find({ email => $email });
}

sub findByLoginOrEmail
{
    my ($self, $params) = @_;
    my $user = $self->findByLogin($params->{"login"}) if($params->{"login"});
    return $user if($user);
    $user = $self->findByEmail($params->{"email"});
    return $user;
}

sub countRegisteredUsers
{
	my ($self, $params) = @_;
	
    my $from = $params->{'from'} || '1970-01-01';
    $from .= ' 00:00:00';
    my $to = $params->{'to'} || '2999-01-01';
    $to .= ' 23:59:59';
    my $scale = $params->{'scale'} || 'day';
    
    my $table = $self->getTable();
    
    my $query = "SELECT UNIX_TIMESTAMP(`created`) AS created, count(*) AS `total` FROM `$table`";
    $query .= " WHERE `created` >= ? AND `created` <= ?";
  	$query .= " GROUP BY TO_DAYS(`created`)" if($scale eq 'day');
    $query .= " GROUP BY YEARWEEK (`created`)" if($scale eq 'week');
    $query .= " GROUP BY EXTRACT(YEAR_MONTH FROM `created`)" if($scale eq 'month');
    $query .= " GROUP BY YEAR(`created`)" if($scale eq 'year');
    $log->debug($query);
    
    my $sth = $::sql->handle->prepare($query);
    my $rv = $sth->execute($from, $to);
    my $result = {};
    while(my $ref = $sth->fetchrow_hashref())
    {
    	$result->{$ref->{'created'}} = $ref->{'total'};
    }
    return $result;
}

sub countActivatedUsers
{
    my ($self, $params) = @_;
    
    my $from = $params->{'from'} || '1970-01-01';
    $from .= ' 00:00:00';
    my $to = $params->{'to'} || '2999-01-01';
    $to .= ' 23:59:59';
    my $scale = $params->{'scale'} || 'day';
    
    my $table = $self->getTable();
    
    my $query = "SELECT `p`.`value`, count(*) AS `total` FROM `$table` u";
    $query .= " JOIN `user_profile` p ON `u`.`id` = `p`.`user_id`";
    $query .= " WHERE `u`.`created` >= ? AND `u`.`created` <= ?";
    $query .= " AND `p`.`name` = 'validateEmail'";
    $query .= " GROUP BY TO_DAYS(FROM_UNIXTIME(`p`.`value`))" if($scale eq 'day');
    $query .= " GROUP BY YEARWEEK (FROM_UNIXTIME(`p`.`value`))" if($scale eq 'week');
    $query .= " GROUP BY EXTRACT(YEAR_MONTH FROM FROM_UNIXTIME(`p`.`value`))" if($scale eq 'month');
    $query .= " GROUP BY YEAR(FROM_UNIXTIME(`p`.`value`))" if($scale eq 'year');
    $log->debug($query);
    
    my $sth = $::sql->handle->prepare($query);
    my $rv = $sth->execute($from, $to);
    my $result = {};
    while(my $ref = $sth->fetchrow_hashref())
    {
        $result->{$ref->{'value'}} = $ref->{'total'};
    }
    return $result;
}

sub countReferalUsers
{
    my ($self, $params) = @_;
    
    my $from = $params->{'from'} || '1970-01-01';
    $from .= ' 00:00:00';
    my $to = $params->{'to'} || '2999-01-01';
    $to .= ' 23:59:59';
    my $scale = $params->{'scale'} || 'day';
    
    my $table = $self->getTable();
    
    my $query = "SELECT UNIX_TIMESTAMP(`created`) AS created, count(*) AS `total` FROM `$table`";
    $query .= " WHERE `created` >= ? AND `created` <= ?";
    $query .= " AND `referal` IS NOT NULL";
    $query .= " GROUP BY TO_DAYS(`created`)" if($scale eq 'day');
    $query .= " GROUP BY YEARWEEK (`created`)" if($scale eq 'week');
    $query .= " GROUP BY EXTRACT(YEAR_MONTH FROM `created`)" if($scale eq 'month');
    $query .= " GROUP BY YEAR(`created`)" if($scale eq 'year');
    $log->debug($query);
       
    my $sth = $::sql->handle->prepare($query);
    my $rv = $sth->execute($from, $to);
    my $result = {};
    while(my $ref = $sth->fetchrow_hashref())
    {
        $result->{$ref->{'created'}} = $ref->{'total'};
    }
    return $result;
}


sub findActive
{
    my ($self) = @_;
    
    my $table = $self->getTable();
    
    my $query = "SELECT `u`.* FROM `$table` u";
    $query .= " JOIN `user_profile` p ON `u`.`id` = `p`.`user_id` ";
    $query .= " WHERE `p`.`name` = 'validateEmail' ";
    
    my $sth = $::sql->handle->prepare($query);
    my $rv = $sth->execute();
    return () if($rv == 0E0);
    my @users;
    while(my $ref = $sth->fetchrow_hashref())
    {
      push(@users, Data::User->new(%$ref));
    }
    
    return @users;
}


sub findSubscribed
{
    my ($self) = @_;
    
    my $table = $self->getTable();
    
    my $query = "SELECT `u`.* FROM `$table` `u` ";
    $query .= " JOIN `user_profile` p  ON `u`.id = `p`.`user_id`  AND `p`.`name`  = 'subscribe' AND `p`.`value` = 'true'";
    $query .= " JOIN `user_profile` pa ON `u`.id = `pa`.`user_id` AND `pa`.`name` = 'validateEmail'";
    
    my $sth = $::sql->handle->prepare( $query );
    my $rv = $sth->execute();
    return () if($rv == 0E0);
    my @users;
    while(my $ref = $sth->fetchrow_hashref())
    {
      push(@users, Data::User->new(%$ref));
    }
    
    return @users;
}

sub findReferals
{
    my ($self, $user) = @_;

    my $table = $self->getTable();
    
    my $query = "SELECT `u`.* FROM `$table` `u`";
    $query .= " JOIN `user_profile` `p` ON `u`.`id` = `p`.`user_id`";
    $query .= " WHERE `p`.`name` = 'validateEmail'";
    $query .= " AND `referal` = ? ";
    
    my $sth = $::sql->handle->prepare($query);
    my $rv = $sth->execute($user->getLogin());
    return () if($rv == 0E0);
    my @users;
    while(my $ref = $sth->fetchrow_hashref())
    {
      push(@users, Data::User->new(%$ref));
    }
    return @users;
}

sub countReferals
{
    my ($self, $user) = @_;

    my $table = $self->getTable();
    
    my $query = "SELECT count(`u`.`id`) AS `total` FROM `$table` `u`";
    $query .= " JOIN `user_profile` `p` ON `u`.`id` = `p`.`user_id`";
    $query .= " WHERE `p`.`name` = 'validateEmail'";
    $query .= " AND `referal` = ? ";
    
    my $sth = $::sql->handle->prepare($query);
    my $rv = $sth->execute($user->getLogin());
    my $ref = $sth->fetchrow_hashref();
    return $ref->{'total'};
}

sub countActiveReferals
{
    my ($self, $user) = @_;

    my $table = $self->getTable();
    
    my $query = "SELECT count(`u`.`id`) AS `total` FROM `$table` `u`";
    $query .= " JOIN `user_profile` `p` ON `u`.`id` = `p`.`user_id`";
    $query .= " WHERE `p`.`name` = 'active' AND `p`.`value` = 'true'";
    $query .= " AND `referal` = ? ";
    
    my $sth = $::sql->handle->prepare($query);
    my $rv = $sth->execute($user->getLogin());
    my $ref = $sth->fetchrow_hashref();
    return $ref->{'total'};
}

sub delete
{
	my ($self, $user) = @_;
	$self->deleteAccount($user);
    $self->deleteProfile($user);
    $self->SUPER::delete($user);	
}

sub deleteProfile()
{
    my ($self, $user, $name) = @_;
    if($name)
    {
        my $sth = $::sql->handle->prepare("DELETE FROM `user_profile` WHERE `user_id` = ? AND `name` = ?");
        $sth->execute($user->getId(), $name);
    }
    else
    {
        my $sth = $::sql->handle->prepare("DELETE FROM `user_profile` WHERE `flag_id` <> 1 AND `user_id` = ?");
        $sth->execute($user->getId());
    }
}

sub deleteAccount()
{
    my ($self, $user) = @_;
    my $sth = $::sql->handle->prepare("DELETE FROM `user_account` WHERE `user_id` = ?");
    $sth->execute($user->getId());
}

1;