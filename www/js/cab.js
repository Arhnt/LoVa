jQuery(function($) {
    $('#inviteForm').on('submit', function(event) {
    	
        var $form = $(this);
        
        // disable register button;
    	$form.find("button[name='invite']") 
    		.addClass("disabled")
    		.attr("disabled", "disabled");        
 
    	// flush errors
		$form.find("div.alert-error").addClass("hide");
		$form.find("div.alert-success").addClass("hide");
    	
        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action') + "/ajax/",
            data: $form.serialize(),
            dataType: 'json',
            error: function(data, status) {
            	// enable register button
            	$form.find("button[name='invite']") 
            		.removeClass("disabled")
            		.removeAttr("disabled");
            	
				$form.find("div.alert-success").addClass("hide");
				$form.find("div.alert-error").removeClass("hide");
				$form.find("div.alert-error").html("Произошла ошибка, попробуйте позже.");
            },
            success: function(data, status) {
            	// enable register button
            	$form.find("button[name='invite']") 
            		.removeClass("disabled")
            		.removeAttr("disabled");
            	
    			if(data.success)
    			{
    				$form.find("div.alert-error").addClass("hide");
    				$form.find("div.alert-success").removeClass("hide");
                	$form.find("input").val(""); 
    			}
    			else
    			{
    				$form.find("div.alert-error").html(data.error);
    				$form.find("div.alert-success").addClass("hide");
    				$form.find("div.alert-error").removeClass("hide");
    			}
            }
        });
 
        event.preventDefault();
    });
    
    $('#payForm').on('submit', function(event) {
        var $form = $(this);
        
    	$form.find("button[name='pay']") 
    		.addClass("disabled")
    		.attr("disabled", "disabled");        
 
		$form.find("div.alert")
			.addClass("hide")
			.removeClass("alert-error")
			.removeClass("alert-success");
    	
        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action') + "/ajax/",
            data: $form.serialize(),
            dataType: 'json',
            error: function(data, status) {
            	$form.find("button[name='pay']") 
            		.removeClass("disabled")
            		.removeAttr("disabled");
            	
				$form.find("div.alert")
					.removeClass("hide")
					.addClass("alert-error")
					.html("Произошла ошибка, попробуйте позже.");
            },
            success: function(data, status) {
    			if(data.success)
    			{
    				$form.find("div.alert")
						.removeClass("hide")
						.removeClass("alert-error")
						.addClass("alert-success")
						.html(data.message);
    				top.location = "/cab/";
    			}
    			else
    			{
                	$form.find("button[name='pay']") 
                		.removeClass("disabled")
            			.removeAttr("disabled");
    				
    				$form.find("div.alert")
						.removeClass("hide")
						.removeClass("alert-success")
						.addClass("alert-error")
						.html(data.message);
    			}
            }
        });
 
        event.preventDefault();
    });
    
    $('#payDiv').on('change', 'input[type=checkbox]', function(event) {
    	var acc = $(this).attr("name");
    	var selected = $('input[name=selectedAccounts]').val().split(",");
    	var i = $.inArray(acc, selected);
		if(i >= 0) { 				
			selected.splice(i, 1); 
		}
    	if($(this).attr('checked')) {
    		selected.push(acc);         
    	}
    	$('input[name=selectedAccounts]').val(selected.join(","));
    	
    	var sum = 0;
    	for(var j = 0; j < selected.length; j++) {
    		if(session[selected[j]]) {
        		sum += session[selected[j]];
    		}
    	}
    	if(sum > session.totalSum) {
    		sum = session.totalSum;
    	}
    	$('#selectedSum').html("$" + sum);
		$('#payForm').find("div.alert")
			.addClass("hide")
			.removeClass("alert-error")
			.removeClass("alert-success");    	
    });
    
    $('#newTicketsDiv').on('change', 'input[type=checkbox]', function(event) {
    	var chks = $('#newTicketsDiv').find('input[type=checkbox]');
    	var checked = false;
    	for(var i = 0; i < chks.length; i++) {
    		if(chks[i].checked) {
    			checked = true;
    			break;
    		}
    	}
    	if(checked) {
			$('#newTicketsDiv').find('button[name=delete]').prop('disabled', false);
    	} else {
   		 	$('#newTicketsDiv').find('button[name=delete]').prop('disabled', true);;
    	}
    });
    
	$("#mobile-dialog").dialog({
		autoOpen: false,
		modal: true,
		width: '90%',
		height: 'auto'
	});
	
	$("#show-mobile").click(function() {
		$("#mobile-dialog").dialog("open");
		return false;
	});
	
	$( "#sms-tabs" ).tabs();
	
});

function sendFirstEmail() {
	var me = this;
	$.ajax({
		url: "/cab/send/ajax/",
		dataType: 'json',
        success: function(data, status) {
        	$('#validateEmail')
        		.removeClass("alert-error")
        		.addClass("aler-success")
        		.html("Письмо со ссылкой было отправлено на почту.");
        }
	});
}

function toggleLotteryNumber(num) {
  var $href = $("#lottery_num_" + num).children("span");
  if(isNumSelected(num)) {
    removeNum(num);
    $href.removeClass("badge-success");
  } else if(countSelectedNumbers() >= config.maxNumbers) {
    alert("Вы выбрали максимальное количество номеров.");
  } else {
    addNum(num);
    $href.addClass("badge-success");
  }
  var selected = countSelectedNumbers();
  $("#count_selected_numbers").html(selected);
  if(!session.limit && (selected == config.maxNumbers)) {
	  $("#addTicketBtn").removeClass("disabled").removeAttr("disabled");
  } else {
	  $("#addTicketBtn").addClass("disabled").attr("disabled", "disabled");
  }
}

function countSelectedNumbers() {
  var numbers_list = $("input[name=selected_lottery_numbers]").val();
  if(numbers_list) {
    var numbers = numbers_list.split(",");
    return numbers.length;
  }
  return 0;
}

function isNumSelected(num) {
  if(!num) {
    return false;
  }
  var numbers_list = $("input[name=selected_lottery_numbers]").val();
  if(numbers_list) {
    var numbers = numbers_list.split(",");
    for(var i = 0; i < numbers.length; i++) {
      if(num == numbers[i]) {
        return true;
      }
    }
  }
  return false;
}

function addNum(num) {
  var numbers_list = $("input[name=selected_lottery_numbers]");
  if(numbers_list.val()) {
	  var numbers = numbers_list.val().split(",");
	  numbers.push(num);
	  numbers_list.val(numbers.join(","));
  } else {
	  numbers_list.val(num);
  }
}

function removeNum(num) {
	var numbers_list = $("input[name=selected_lottery_numbers]").val();
	if(numbers_list) {
		var numbers = numbers_list.split(",");
		for(var i = 0; i < numbers.length; i++) {
			if(num == numbers[i]) {
				numbers.splice(i, 1);
				break;
			}
		}
		$("input[name=selected_lottery_numbers]").val(numbers.join(","));
	}
}

function autoSelectNumbers() {
	$("input[name=selected_lottery_numbers]").val("");
	for(var i = 1; i <= config.maxNumber; i++) {
		$("#lottery_num_" + i).children("span").removeClass("badge-success");
	}
  
	var selectedNumbers = 0;
	while(selectedNumbers < config.maxNumbers) {
		var num = Math.floor((Math.random() * config.maxNumber) + 1);
		if(!isNumSelected(num)) {
			selectedNumbers++;
			addNum(num);
			$("#lottery_num_" + num).children("span").addClass("badge-success");
		}
	}
	
	$("#count_selected_numbers").html(countSelectedNumbers());
	$("#addTicketBtn").removeClass("disabled").removeAttr("disabled");
}  

function incGame() {
	var val = $("input[name=games_count]").val();
	if(isNaN(val) || val < 1) {
		val = 1;
	} else if(val < config.maxGames) {
		val++;
	} else {
		val = config.maxGames;
	}
	$("input[name=games_count]").val(val);
}

function decGame() {
	var val = $("input[name=games_count]").val();
	if(isNaN(val) || val <= 1) {
		val = 1;
	} else if(val <= config.maxGames) {
		val--;
	} else {
		val = config.maxGames;   
	}
	$("input[name=games_count]").val(val);
}

function incTickets() {
	var val = $("input[name=tickets_count]").val();
	if(isNaN(val) || val < 1) {
		val = 1;
	} else if(val < config.maxTickets) {
		val++;
	} else {
		val = config.maxTickets;
	}
	$("input[name=tickets_count]").val(val);
}

function decTickets() {
	var val = $("input[name=tickets_count]").val();
	if(isNaN(val) || val <= 1) {
		val = 1;
	} else if(val <= config.maxTickets) {
		val--;
	} else {
		val = config.maxTickets;   
	}
	$("input[name=tickets_count]").val(val);
}

function addTicket() {
	var selected = countSelectedNumbers();
	if(selected < config.maxNumbers) {
		alert("Вы выбрали не все числа. Осталось " + (config.maxNumbers - selected));
	} else if(selected == config.maxNumbers) {
		$("form[name=lottery]").attr("action", "/cab/tickets/add/").submit();
	}
}
