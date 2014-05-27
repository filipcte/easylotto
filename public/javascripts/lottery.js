var Lottery = {

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
				Lottery.triggerDraw();
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

	endDraw: function() {
		$('#draw-result-wrap').fadeOut();
	},

	triggerDraw: function() {
		$('#draw-result-wrap #draw-result div').html('');
		$('#draw-result-wrap #draw-result img').show();

		// show big overlay
		$('#draw-result-wrap').show();

		var url = $('#trigger-draw').data('url');
		
		// Ajax request to perform the draw and get the winning ticket
		$.getJSON(url, function(response) {
			Lottery.showDrawResult(response.winningTicket);
		});
	},

	// After a ticket has been sold, inject it into DOM
	showSoldTickets: function(tickets) {
		var ticketsHtml = '';
		$.each(tickets, function(i, ticket) {
			ticketsHtml += '<li>' + ticket + '</li>';
		});
		$('ul#sold-tickets-list').prepend($(ticketsHtml));
	},

	// Once a draw ends, show the result (winning ticket) on the page
	showDrawResult: function(winningTicket) {
		setTimeout(function() {
			$('#draw-result-wrap #draw-result img').hide();

			var ticket_parts = winningTicket.split(' ');

			$.each(ticket_parts, function(i, part) {
				// change overlay bg color according to winning ticket's color
				if (i == 0) {
					Lottery.changeBgColor(part);
				}

				$('<span class="draw-result-part" id="result-part-' + i + '">' + part + '</span>').appendTo($('#draw-result-wrap #draw-result div'));

				setTimeout(function() {
					$('#draw-result-wrap #draw-result div span#result-part-' + i).fadeIn('slow');	
				}, 1500 * (i + 1));
				
			});
		}, 3000);

		var winningTicketHtml = $('<li>' + winningTicket + '</li>');
		$('#draw-results').prepend(winningTicketHtml);
	},

	changeBgColor: function(color) {
		var newColor = '#FFFF00';

		if (color == 'blue') {
			newColor = '#1E90FF';
		}
		else if (color == 'yellow') {
			newColor = '#FFFF00';
		}
		else if (color == 'green') {
			newColor = '#32CD32';
		}
		else if (color == 'white') {
			newColor = '#fff';
		}
		else if (color == 'pink') {
			newColor = '#FFB6C1';
		}

		$('#draw-result-wrap').css('background-color', newColor);

	}
}
