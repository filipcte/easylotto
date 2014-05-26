var Lottery = {

	// Init stuff
	init: function() {
		// draw		
		if ($('#trigger-draw').length) {
			// click on the DRAW button
			$('#trigger-draw').click(function() {
				var url = $(this).data('url');

				// Ajax request to perform the draw and get the winning ticket
				$.getJSON(url, function(response) {
					Lottery.showDrawResult(response.winningTicket);
				});

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
		var winningTicket = $('<li>' + winningTicket + '</li>');
		$('#draw-results #results ul').prepend(winningTicket);
	}
}
