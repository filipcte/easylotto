var express = require('express');
var router = express.Router();
var _ = require('lodash');
var mongoose = require('mongoose');
var Lottery = mongoose.model('Lottery');
var User = mongoose.model('User');

mongoose.connect('mongodb://localhost/lotto');

///////////////////////////////

// User seeder
// TODO: remove this once signup is implemented
router.get('/seed999', function(req, res) {
	User.create({ email: 'kes@teknograd.no', password: User.generatePassHash('passw0rd')}, function(err, user) {
		res.send('ok');
	});
});
	
// Create tickets automatically
// router.get('/admin/lottery/:id/seed888', function(req, res) {
// 	var lotteryId = req.params.id;

// 	Lottery.findById(lotteryId, function(err, lottery) {
// 		lottery.tickets_sold = [];
// 		lottery.tickets_for_draw = [];
// 		lottery.save();
		
// 		//var abc_str = "abcdefghijklmnopqrstuvwxyzæøå";
// 		var abc_str = "abc";
// 	 	var abc = abc_str.toUpperCase().split("");
	 	
// 		_(lottery.ticket_colors).forEach(function(col) {
// 			_(abc).forEach(function(letter) {
// 				for (i = 1; i <= 50; i++) {
// 					//console.log(col.name+' '+letter+' '+i)
// 					var color = col.name;
// 					var colorHex = col.hex;
// 					var numberRange = i;
// 					var descWithoutNumber = strCapitalize(color) + ' ' + letter;
// 					var soldTickets = [];
					
// 					// prepare new ticket
// 					var newTicket = {
// 						description: descWithoutNumber + ' ' + numberRange,
// 						desc_without_number: descWithoutNumber,
// 						color_hex: colorHex,
// 						color: color,
// 						letter: letter,
// 						number: numberRange,
// 						created_at: Date.now()
// 					};
					
// 					lottery.tickets_sold.push(newTicket);

// 					var lastSoldTicketId = lottery.tickets_sold[lottery.tickets_sold.length - 1].id;
// 					// add ticket in the drawing pool
// 					lottery.tickets_for_draw.push({ description: descWithoutNumber + ' ' + numberRange, sold_ticket_id: lastSoldTicketId });

// 					lottery.save();
// 				}
// 			});		
// 		});
// 		res.send('done');
// 	});
// });

///////////////////////////////

// login
router.post('/login', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;

	User.findOne({ email: email }, function(err, user) {
		if (user === null) {
			res.redirect('/');
		}
		else {
			if (user.validPassword(password)) {
				 req.session.regenerate(function(){
	         req.session.user = user;
	         res.redirect('/admin');
	      });
			}
			else {
				res.redirect('/');
			}
		}
	});
});

// home
router.get('/', function(req, res) {
	res.render('index', { title: 'Lotto' });
});

// admin page (lottery listing)
router.get('/admin', function(req, res) {
	//if (!req.session.user) { res.redirect('/'); }

	Lottery.find(function(err, lotteries, count) {
		res.render('admin', { lotteries: lotteries })
	}); 
});

// create a new lottery
router.post('/admin/lottery/create', function(req, res) {
	//if (!req.session.user) { res.redirect('/'); }

	var lotteryName = req.body.lottery_name;
	var defaultColors = [
		{ name: 'Blå', hex: '#1E90FF' },
		{ name: 'Gul', hex: '#FFFF00' },
		{ name: 'Grønn', hex: '#32CD32' },
		{ name: 'Rosa', hex: '#FFB6C1' }
	];

	new Lottery({ 
		name: lotteryName,
		ticket_colors: defaultColors
	}).save(function(err, lottery, count) {
		res.redirect('/admin/lottery/' + lottery.id);
	});  
});

// view lottery page
router.get('/admin/lottery/:id', function(req, res) {
	//if (!req.session.user) { res.redirect('/'); }

	var lotteryId = req.params.id;

	Lottery.findById(lotteryId, function(err, lottery) {
		if (typeof lottery == 'undefined') {
			res.redirect('/admin');
		}
		console.log(lottery.tickets_for_draw.length)
		res.render('admin_lottery', { lottery: lottery })
	}); 
});

// delete lottery
router.get('/admin/lottery/:id/remove', function(req, res) {
	//if (!req.session.user) { res.redirect('/'); }

	var lotteryId = req.params.id;

	Lottery.findByIdAndRemove(lotteryId, function(err) {
		res.redirect('/admin');
	}); 
});

// change lottery status
router.get('/admin/lottery/:id/status/', function(req, res) {
	//if (!req.session.user) { res.redirect('/'); }

	var lotteryId = req.params.id;
	var newStatus = req.query.s;
	var allowedStatuses = [ 'open', 'draw', 'closed' ];

	if (allowedStatuses.indexOf(newStatus) != -1) {
		Lottery.findById(lotteryId, function(err, lottery) {

			if (typeof lottery == 'undefined') {
				res.redirect('/admin');
			}

			lottery.status = newStatus;

			lottery.save(function() {
				res.redirect('/admin/lottery/' + lotteryId);	
			});
		});   
	}
	else {
		res.send('oops');
	}
});

// lottery draw action
router.get('/admin/lottery/:id/draw', function(req, res) {
	//if (!req.session.user) { res.redirect('/'); }

	var lotteryId = req.params.id;

	Lottery.findById(lotteryId, function(err, lottery) {
		if (typeof lottery == 'undefined') {
			// AJAX error handling
		}

		// determine winning ticket
		var min = 0;
		var max = lottery.tickets_for_draw.length - 1;
		var random = Math.floor(Math.random() * (max - min + 1) + min);
		var winningTicket = lottery.tickets_for_draw[random];

		if (typeof winningTicket == 'undefined') {
			var response = { success: false };	
			res.json(response);
		}
		else {
			// remove from available tickets
			if (lottery.tickets_for_draw.length > 0) {
				lottery.tickets_for_draw.id(winningTicket.id).remove();	
			}
			var color = winningTicket.description.split(' ');
			color = color[0];
			var colorHex = '#eeeeee';

			// determine hex color for chosen color
			for (var i in lottery.ticket_colors) {
				if (lottery.ticket_colors[i].name == color) {
					colorHex = lottery.ticket_colors[i].hex;
				}
			}

			// Save this drawing
			var newDrawing = {
				winning_ticket: winningTicket.description,
				color_hex: colorHex,
				created_at: Date.now()
			};
			lottery.drawings.push(newDrawing);

			lottery.save(function() {
				var response = { success: true, winningTicket: winningTicket.description, colorHex: colorHex };	
				res.json(response);
			});	
		}
	}); 
});

// lottery sell tickets
router.post('/admin/lottery/:id/sell', function(req, res) {
	//if (!req.session.user) { res.redirect('/'); }

	var lotteryId = req.params.id;

	Lottery.findById(lotteryId, function(err, lottery) {
		if (typeof lottery == 'undefined') {
			// AJAX error handling
		}

		var color = req.body.color;
		var letter = req.body.letter.toUpperCase();
		var numberRange = req.body.number;
		var descWithoutNumber = strCapitalize(color) + ' ' + letter;
		var soldTickets = [];
		var colorHex = '#eeeeee';

		// determine hex color for chosen color
		for (var i in lottery.ticket_colors) {
			if (lottery.ticket_colors[i].name == color) {
				colorHex = lottery.ticket_colors[i].hex;
			}
		}

		// prepare new ticket
		var newTicket = {
			description: descWithoutNumber + ' ' + numberRange,
			desc_without_number: descWithoutNumber,
			color_hex: colorHex,
			color: color,
			letter: letter,
			number: numberRange,
			created_at: Date.now()
		};
		
		lottery.tickets_sold.push(newTicket);
		soldTickets.push({ description: newTicket.description, color_hex: newTicket.color_hex });

		// save new ticket
		lottery.save(function(err, lottery) {
			var lastSoldTicketId = lottery.tickets_sold[lottery.tickets_sold.length - 1].id;

			// check if number is range (e.g. 1-10), in which case break it down and add separate entries for each item in range
			if (numberRange.indexOf('-') != -1) {
				var number = numberRange.split('-');
				var numberMin = number[0];
				var numberMax = number[1];

				// loop through numbers in the range and add individual tickets in the drawing pool
				for (var i = numberMin; i <= numberMax; i++) {
					var description = descWithoutNumber + ' ' + i;
					lottery.tickets_for_draw.push({ description: description, sold_ticket_id: lastSoldTicketId  });
				}
			}
			else {
				// add ticket in the drawing pool
				lottery.tickets_for_draw.push({ description: descWithoutNumber + ' ' + numberRange, sold_ticket_id: lastSoldTicketId });
			}

			lottery.save();

			var response = { success: true, tickets: soldTickets };	
			res.json(response);
		});
	}); 
});

// remove sold lottery ticket
router.get('/admin/lottery/:id/remove-ticket/:ticket_id', function(req, res) {
	//if (!req.session.user) { res.redirect('/'); }

	var lotteryId = req.params.id;
	var ticketId = req.params.ticket_id;

	Lottery.findById(lotteryId, function(err, lottery) {
		if (typeof lottery == 'undefined') {
			// error handling
		}

		// delete sold ticket
		lottery.tickets_sold.id(ticketId).remove();

		// also remove all corresponding tickets from the drawing pool
		lottery.tickets_for_draw = _.remove(lottery.tickets_for_draw, function(ticket) {
			return (ticket.sold_ticket_id != ticketId ? true : false);
		});

		lottery.save(function() {
			res.redirect('/admin/lottery/' + lotteryId);	
		});
	});
});

module.exports = router;

function strCapitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}