var express = require('express');
var passport = require('passport');
var router = express.Router();
var _ = require('lodash');
var mongoose = require('mongoose');
var Lottery = mongoose.model('Lottery');
var User = mongoose.model('User');
// var passport = require('../config/passport');

mongoose.connect('mongodb://localhost/lotto');

///////////////////////////////

module.exports = function(app, passport) {
	// Create tickets automatically
	app.get('/admin/lottery/:id/seed888', function(req, res) {
		var lotteryId = req.params.id;

		Lottery.findById(lotteryId, function(err, lottery) {
			var abc_str = "abcdefghijklmnopqrstuvwxyzæøå";
		 	var abc = abc_str.toUpperCase().split("");
		 	
			_(lottery.ticket_colors).forEach(function(col) {
				_(abc).forEach(function(letter) {
						var color = col.name;
						var colorHex = col.hex;
						var numberRange = '1-100';
						var descWithoutNumber = strCapitalize(color) + ' ' + letter;
						var soldTickets = [];
						
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

						var lastSoldTicketId = lottery.tickets_sold[lottery.tickets_sold.length - 1].id;

						// add ticket in the drawing pool
						// loop through numbers in the range and add individual tickets in the drawing pool
						for (i = 1; i <= 100; i++) {
							var description = descWithoutNumber + ' ' + i;
							lottery.tickets_for_draw.push({ description: description, sold_ticket_id: lastSoldTicketId  });
						}
				});		
			});
			lottery.save();
			res.send('done');
		});
	});

	///////////////////////////////

	// Home
	app.get('/', function(req, res) {
		res.render('index', { title: 'Lotto' });
	});

	// Logout
	app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

	// LOCAL LOGIN
	// ===========
	// Login
	app.get('/login', function(req, res) {
        res.render('login', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/admin', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // GOOGLE LOGIN
    // ============
    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

	// Signup
	app.get('/signup', function(req, res) {
        res.render('signup', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/admin', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

	// admin page (lottery listing)
	app.get('/admin', isLoggedIn, function(req, res) {

		Lottery.find(function(err, lotteries, count) {
			res.render('admin', { lotteries: lotteries })
		});

	});

	// create a new lottery
	app.post('/admin/lottery/create', isLoggedIn, function(req, res) {

		var lotteryName = req.body.lottery_name;
		var defaultColors = [
			{ name: 'Blue', hex: '#1E90FF' },
			{ name: 'Yellow', hex: '#FFFF00' },
			{ name: 'Green', hex: '#32CD32' },
			{ name: 'Pink', hex: '#FFB6C1' },
			{ name: 'White', hex: '#FFFFFF' }
		];

		new Lottery({ 
			name: lotteryName,
			ticket_colors: defaultColors,
			// user: req.user.id
		}).save(function(err, lottery, count) {
			res.redirect('/admin/lottery/' + lottery.id);
		});
	});

	// view lottery page
	app.get('/admin/lottery/:id', isLoggedIn, function(req, res) {

		var lotteryId = req.params.id;

		Lottery.findById(lotteryId, function(err, lottery) {
			if (typeof lottery == 'undefined') {
				res.redirect('/admin');
			}
			
			res.render('admin_lottery', { lottery: lottery })
		}); 
	});

	// delete lottery
	app.get('/admin/lottery/:id/remove', isLoggedIn, function(req, res) {
		//if (!req.session.user) { res.redirect('/'); }

		var lotteryId = req.params.id;

		Lottery.findByIdAndRemove(lotteryId, function(err) {
			res.redirect('/admin');
		}); 
	});

	// change lottery status
	app.get('/admin/lottery/:id/status/', isLoggedIn, function(req, res) {
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
	app.get('/admin/lottery/:id/draw', isLoggedIn, function(req, res) {
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
	app.post('/admin/lottery/:id/sell', isLoggedIn, function(req, res) {
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
	app.get('/admin/lottery/:id/remove-ticket/:ticket_id', function(req, res) {
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

	// view public lottery page
	app.get('/lottery/:id', isLoggedIn, function(req, res) {

		var lotteryId = req.params.id;

		Lottery.findById(lotteryId, function(err, lottery) {
			if (typeof lottery == 'undefined') {
				res.redirect('/');
			}
			
			res.render('lottery_public', { lottery: lottery });
		}); 
	});
}


function strCapitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}