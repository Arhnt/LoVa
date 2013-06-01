package Data::User;
use strict;
use lib "..";
use parent 'Data::BaseObject';

my $salt = "SALT!"; 

sub getFields
{
	return
	(
	    'id' => 'id',
	    'firstName' => 'first_name',
	    'lastName' => 'last_name',
	    'login' => 'login',
	    'email' => 'email',
	    'password' => 'password',
        'referal' => 'referal_id'
	)
};

sub setPassword
{
	my ($self, $password) = @_;
	if($password)
	{
		my $crypted = crypt($password, $salt);
		$self->SUPER::setPassword($crypted);
	}
}

sub checkPassword
{
    my ($self, $password) = @_;
    if($password)
    {
        my $crypted = crypt($password, $salt);
    	if($crypted eq $self->getPassword())
    	{
    		return 1;
    	}
    }
    return undef;
}

1;