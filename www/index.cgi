#!/usr/bin/perl
use strict;
use utf8;

use FindBin qw($Bin);
use lib "$Bin/../lib/";
use CGI::Carp qw ( fatalsToBrowser );

use Sirius::Common qw(debug);

use options;
use global;

#=======================Variables=========================

our $sql     = Sirius::MySQL->new(host=>$MYSQL{'host'}, db=>$MYSQL{'base'}, user=>$MYSQL{'user'}, password=>$MYSQL{'pass'}, debug=>1);
my $dbh      = $sql->connect;
my $CGI      = new CGI;
my $template = Template->new({RELATIVE=>1});
my $json     = JSON->new->allow_nonref;

# Используемые переменные
# vars - переменные шаблона TT
# lang - текущий язык, устанавливается функцией get_lang
# redirect - флаг переадрессации,содержит новый адрес
my ($vars, $redirect);
my $lang = 'ru';

# Cookies - принимаем Cookie от клиента, ожидаем sid
my %cookies = fetch CGI::Cookie;

# Идентификатор сессии принимаем из Cookie
my $sid = ($cookies{'sid'}) ? $cookies{'sid'}->value : undef;

# Загружаем сессию с принятым ID или начинаем новую со сгенерированым идентификатором
my $cgiSession = new CGI::Session("driver:MySQL;", $sid, {Handle=>$dbh});
$cgiSession->expire('+1y');
 
# Cookie с идентификатором сессии к клиенту
my $cookie = new CGI::Cookie(-name=>'sid', -value=>$cgiSession->id());

# Services
my $userService = new Service::User();


checkUserLogin();
checkReferal();

#=======================Template Variables================
 
$vars->{'lang'} = $lang;
$vars->{'error'} = "";
$vars->{'url'} = $URL;
$vars->{'userId'} = $cgiSession->param('userId');

#=======================Main Stage========================

if($URL =~ /\/ajax(\/|$)/)
{
    print $CGI->header(-expires=>'now', -charset=>'UTF-8', -pragma=>'no-cache', -cookie=>$cookie);
    ajaxStage()
}
elsif($redirect)
{
    print $CGI->redirect(-uri=>$redirect, -cookie=>$cookie);
}
else
{
    print $CGI->header(-expires=>'now', -charset=>'UTF-8', -pragma=>'no-cache', -cookie=>$cookie);
    $template->process("../tmpl/$lang/main.tmpl", $vars) || die "Template process failed: ", $template->error(), "\n";
}

#=======================End Main Stage====================

$cgiSession->flush();
$sql->disconnect();
 
#====================== Subs =============================

# Функция вызывается, если в ссылке есть /ajax/
sub ajaxStage
{
    if($URL =~ /\/register\//)
    {
    	my $params = $CGI->Vars();
    	my $user = $userService->createUserFromCgiParams($params);
    	my $validationStatus = $userService->validate($user);
    	if($validationStatus->{'success'} eq 'true')
    	{
    		$user->setReferal($cgiSession->param('ref'));
            $userService->save($user);
            $cgiSession->param('userId', $user->getId());
    	}
    	my $jsonResult = $json->encode($validationStatus);
    	print $jsonResult;
    }
}

sub checkUserLogin
{
    if($URL =~ /\/login(\/|$)/)
    {
    	my $login = $CGI->param("login");
        my $pwd = $CGI->param("password");
    	my $user = $userService->findByLogin($login);
    	if($user && $user->checkPassword($pwd))
    	{
            $cgiSession->param('userId', $user->getId());
            $redirect = "/cab/";   		
    	}
    }
}

sub checkReferal
{
	my $ref = $CGI->param('ref');
	if($ref)
	{
        my $user = $userService->findByLogin($ref);
        if($user)
        {
            $cgiSession->param('ref', $user->getId());       
        }
	}
}