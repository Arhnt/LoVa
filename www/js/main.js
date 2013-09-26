function loginAction()
{
	$(".login").css('visibility', 'visible');
	
	var $form = $('#loginForm');
	var email = $form.find("input[name=email]");

	if(email[	0].value)
	{
		$form.submit();
	}
}

function fbShare()
{
    window.open("https://www.facebook.com/sharer/sharer.php?u=lova.su", 'sharer', 'width=626,height=436');
    return false;
}

function okShare()
{
    var url = "http://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1";
    url += '&st.comments=' + encodeURIComponent("Я зарегистрирован на lova.su. Там вся страна!");
    url += '&st._surl=' + encodeURIComponent("http://lova.su");
    window.open(url, 'sharer', 'width=626,height=436');
    return false;
}

function mmShare()
{
    var url = "http://connect.mail.ru/share";
    url += '?title=' + encodeURIComponent("LOVA");
    url += '&url=' + encodeURIComponent("http://lova.su/");
    url += '&description=' + encodeURIComponent("Я зарегистрирован на lova.su. Там вся страна!");
    url += '&imageurl=' + encodeURIComponent("http://lova.su/img/logo.jpg");
    window.open(url, 'sharer', 'width=626,height=436');
    return false;
}

jQuery(function($) {
	
	if (window['VK'] != undefined)
	{
	    VK.Share.button({ url: 'http://lova.su', title: 'LOVA', image: 'http://lova.su/img/logo.jpg'}, { type: 'link',  text: ''});
	}
	
    $('#registerForm').on('submit', function(event) {
    	
        var $form = $(this);
        
        // disable register button;
    	var $btn = $form.find("button[name='register']"); 
    	$btn.addClass("disabled");
    	$btn.attr("disabled", "disabled");        
 
    	// flush errors
    	$form.find("input")
			.closest('.control-group')
			.removeClass('error');
    	$form.find("input")
			.parent()
			.children("span")
			.html("");
    	
        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action') + "/ajax/",
            data: $form.serialize(),
            dataType: 'json',
            error: function(data, status) {
            	// enable register button
            	var $btn = $form.find("button[name='register']"); 
            	$btn.removeClass("disabled");
            	$btn.removeAttr("disabled");
				alert("Произошла ошибка, попробуйте позже.");
            },
            success: function(data, status) {
            	// enable register button
            	var $btn = $form.find("button[name='register']"); 
            	$btn.removeClass("disabled");
            	$btn.removeAttr("disabled");
            	
    			if(data.success === "true")
    			{
    				top.location = "/cab/";
    			}
    			else
    			{
    				for(field in data.fields)
    				{
    					$("#registerForm")
    						.find("input[name='" + field + "']")
    						.closest('.control-group')
    						.addClass('error');
    					$("#registerForm")
    						.find("input[name='" + field + "']")
    						.parent()
    						.children("span")
    						.html(data.fields[field]);
    				}
    			}
            }
        });
 
        event.preventDefault();
    });

    $('#profileForm').on('submit', function(event) {
    	
        var $form = $(this);
        
        // disable register button;
    	var $btn = $form.find("button[name='save']"); 
    	$btn.addClass("disabled");
    	$btn.attr("disabled", "disabled");        
 
    	// flush errors
    	$form.find("input")
			.closest('.control-group')
			.removeClass('error');
    	$form.find("input")
			.parent()
			.children("span")
			.html("");
    	
        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action') + "/ajax/",
            data: $form.serialize(),
            dataType: 'json',
            error: function(data, status) {
            	// enable register button
            	var $btn = $form.find("button[name='save']"); 
            	$btn.removeClass("disabled");
            	$btn.removeAttr("disabled");
				alert("Произошла ошибка, попробуйте позже.");
            },
            success: function(data, status) {
            	// enable register button
            	var $btn = $form.find("button[name='save']"); 
            	$btn.removeClass("disabled");
            	$btn.removeAttr("disabled");
            	
    			if(data.success === "true")
    			{
    				top.location = "/cab/";
    			}
    			else
    			{
    				for(field in data.fields)
    				{
    					$("#profileForm")
    						.find("input[name='" + field + "']")
    						.closest('.control-group')
    						.removeClass('info')
    						.addClass('error');
    					$("#profileForm")
    						.find("input[name='" + field + "']")
    						.parent()
    						.children("span")
    						.html(data.fields[field]);
    				}
    			}
            }
        });
 
        event.preventDefault();
    });

    $('.network-icons a').on('click', function(event) {
    	$.ajax("/like/ajax/");
    	$('div#alert')
  			.removeClass("arrow")
  			.addClass("ajax-loading");

    	setTimeout(function(){
    		$('div#alert')
    			.removeClass("alert-error")
    			.removeClass("ajax-loading")
    			.addClass("alert-success")
        		.html("Вы использовали все возможности кабинета! :-)");
    	}, 20000);
    });
    
   
    $('#restoreForm').on('submit', function(event) {
        var $form = $(this);
        
        // disable register button;
    	var $btn = $form.find("button[name='restore']"); 
    	$btn.addClass("disabled");
    	$btn.attr("disabled", "disabled");
    	// flush errors
    	$form.find("input")
			.closest('.control-group')
			.removeClass('error');
    	$form.find("input")
			.parent()
			.children("span")
			.html("");
    	
        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action') + "/ajax/",
            data: $form.serialize(),
            dataType: 'json',
            error: function(data, status) {
            	// enable register button
            	var $btn = $form.find("button[name='restore']"); 
            	$btn.removeClass("disabled");
            	$btn.removeAttr("disabled");
				$form.find("div.alert-error").html("Произошла ошибка, попробуйте позже").removeClass("hide");
            },
            success: function(data, status) {
            	// enable register button
            	$form.find("button[name='restore']") 
            		.removeClass("disabled")
            		.removeAttr("disabled");
            	
    			if(data.success === "true")
    			{
    				$form.find("div.alert-error").addClass("hide");
    				$form.find("div.alert-success").removeClass("hide");
    			}
    			else
    			{
    				$form.find("div.alert-success").addClass("hide");
    				$form.find("div.alert-error").removeClass("hide");
    			}
            }
        });
 
        event.preventDefault();
    });
    
	$("#licence-dialog").dialog({
		//autoOpen: false,
		modal: true,
		width: '90%',
		height: 'auto'
	});
	
	$(".show-licence").click(function() {
		$("#licence-dialog").dialog("open");
		return false;
	});
	
});

