var Lottery = {

	// Init stuff
	init: function() {
		// do a draw
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
	},

	// Once a draw ends, show the result (winning ticket) on the page
	showDrawResult: function(winningTicket) {
		var winningTicket = $('<li>' + winningTicket + '</li>');
		$('#draw-results #results ul').append(winningTicket);
	}
}
