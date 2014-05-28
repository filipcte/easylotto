var Lottery = {
	// flag
	drawInProgress: false,

	// Init stuff
	init: function() {
		// draw		
		if ($('#trigger-draw').length) {

			$(document).bind('keydown', 'esc', Lottery.endDraw);
			$(document).bind('keydown', 'return', Lottery.triggerDraw);	

			// overlay click handling
			$('#draw-result-wrap').click(Lottery.triggerDraw);

			// click on the DRAW button
			$('#trigger-draw').click(function() {
				Lottery.triggerDraw(true);
				return false;
			});
		}

		// add sold tickets
		if ($('#add-sold-ticket').length) {
			$('#add-sold-ticket').submit(function() {
				$.post($(this).attr('action'), $(this).serialize(), function(response) {
					Lottery.showSoldTickets(response.tickets);
				});
				return false;
			});
		}
	},

	// End drawing (close overlay)
	endDraw: function() {
		Lottery.drawInProgress = false;
		$('#draw-result-wrap').fadeOut();
	},

	// Perform a draw
	triggerDraw: function(triggerAnyway) {
		if (($('#draw-result-wrap').is(':visible') && Lottery.drawInProgress === false) || triggerAnyway === true) {
			Lottery.drawInProgress = true;

			$('#draw-result-wrap #draw-result div').html('');
			$('#draw-result-wrap #draw-result img').show();

			// show big overlay
			$('#draw-result-wrap').show();

			var url = $('#trigger-draw').data('url');
			
			// Ajax request to perform the draw and get the winning ticket
			$.getJSON(url, function(response) {
				if (response.success === false) {
					Lottery.endDraw();
				}
				else {
					Lottery.showDrawResult(response.winningTicket, response.colorHex);	
				}
			});
		}
		else {
			return ;
		}
	},

	// After a ticket has been sold, inject it into DOM
	showSoldTickets: function(tickets) {
		var ticketsHtml = '';
		$.each(tickets, function(i, ticket) {
			ticketsHtml += '<li><a style="background-color: ' + ticket.color_hex + ';" href="javascript:;">' + Lottery.capitaliseFirstLetter(ticket.description) + '</a></li>';
		});
		$('ul#sold-tickets-list').prepend($(ticketsHtml));
	},

	// Once a draw ends, show the result (winning ticket) on the page
	showDrawResult: function(winningTicket, colorHex) {
		setTimeout(function() {
			$('#draw-result-wrap #draw-result img').hide();

			var ticket_parts = winningTicket.split(' ');

			$.each(ticket_parts, function(i, part) {
				// change overlay bg color according to winning ticket's color
				if (i == 0) {
					Lottery.changeBgColor(part);
				}

				$('<span class="draw-result-part" id="result-part-' + i + '">' + Lottery.capitaliseFirstLetter(part) + '</span>').appendTo($('#draw-result-wrap #draw-result div'));

				setTimeout(function() {
					$('#draw-result-wrap #draw-result div span#result-part-' + i).fadeIn('slow');	

					if (i == ticket_parts.length - 1) {
						Lottery.drawInProgress = false;
					}
				}, 1500 * (i + 1));
			});
		}, 3000);

		var winningTicketHtml = $('<li><a style="background-color: ' + colorHex + ';" href="javascript:;">' + Lottery.capitaliseFirstLetter(winningTicket) + '</a></li>');
		$('#draw-results').prepend(winningTicketHtml);
	},

	changeBgColor: function(color) {
		var newColor = '#FFFF00';

		if (color == 'blå') {
			newColor = '#1E90FF';
		}
		else if (color == 'gul') {
			newColor = '#FFFF00';
		}
		else if (color == 'grønn') {
			newColor = '#32CD32';
		}
		else if (color == 'white') {
			newColor = '#fff';
		}
		else if (color == 'rosa') {
			newColor = '#FFB6C1';
		}

		$('#draw-result-wrap').css('background-color', newColor);
	},

	capitaliseFirstLetter: function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
	}
}
