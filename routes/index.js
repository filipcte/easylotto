var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Lottery = mongoose.model('Lottery');

mongoose.connect('mongodb://localhost/lotto');

// home
router.get('/', function(req, res) {
	res.render('index', { title: 'Lotto' });
});

// admin page (lottery listing)
router.get('/admin', function(req, res) {
	Lottery.find(function(err, lotteries, count) {
		res.render('admin', { lotteries: lotteries })
	}); 
});

// create a new lottery
router.post('/admin/lottery/create', function(req, res) {
	var lotteryName = req.body.lottery_name;

	new Lottery({ 
		name: lotteryName
	}).save(function(err, lottery, count) {
		res.redirect('/admin/lottery/' + lottery.id);
	});  
});

// view lottery page
router.get('/admin/lottery/:id', function(req, res) {
	var lotteryId = req.params.id;

	Lottery.findById(lotteryId, function(err, lottery) {
		if (typeof lottery == 'undefined') {
			res.redirect('/admin');
		}

		// Lottery.aggregate(
	 //    { $group: { _id: '$tickets_sold.desc_without_number',  }},
		//   { $project: { _id: 1 }},
		//   function (err, res) {
		//   	console.log(err)
		//   	console.log(res);
		// });


		res.render('admin_lottery', { lottery: lottery })
	}); 
});

// delete lottery
router.get('/admin/lottery/:id/remove', function(req, res) {
	var lotteryId = req.params.id;

	Lottery.findByIdAndRemove(lotteryId, function(err) {
		res.redirect('/admin');
	}); 
});

// change lottery status
router.get('/admin/lottery/:id/status/', function(req, res) {
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

// lottery drawings
router.get('/admin/lottery/:id/drawings', function(req, res) {
	var lotteryId = req.params.id;

	Lottery.findById(lotteryId, function(err, lottery) {
		if (typeof lottery == 'undefined') {
			res.redirect('/admin');
		}

		res.render('admin_lottery_draw', { lottery: lottery })
	}); 
});

// lottery draw action
router.get('/admin/lottery/:id/draw', function(req, res) {
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

		// remove from available tickets
		if (lottery.tickets_for_draw.length > 0) {
			lottery.tickets_for_draw.id(winningTicket.id).remove();	
		}

		// Save this drawing
		var newDrawing = {
			winning_ticket: winningTicket.description,
			created_at: Date.now()
		};
		lottery.drawings.push(newDrawing);

		lottery.save(function() {
			var response = { success: true, winningTicket: winningTicket.description };	
			res.json(response);
		});
	}); 
});

// lottery draw action
router.post('/admin/lottery/:id/sell', function(req, res) {
	var lotteryId = req.params.id;

	Lottery.findById(lotteryId, function(err, lottery) {
		if (typeof lottery == 'undefined') {
			// AJAX error handling
		}

		var color = req.body.color;
		var letter = req.body.letter.toUpperCase();
		var numberRange = req.body.number;
		var descWithoutNumber = color + ' ' + letter;
		var soldTickets = [];

		// check if number is range (e.g. 1-10), in which case break it down and add separate entries for each item in range
		if (numberRange.indexOf('-') != -1) {
			var number = numberRange.split('-');
			var numberMin = number[0];
			var numberMax = number[1];

			for (var i = numberMin; i <= numberMax; i++) {
				var description = descWithoutNumber + ' ' + i;

				// Add this ticket
				var newTicket = {
					description: description,
					desc_without_number: descWithoutNumber,
					color: color,
					letter: letter,
					number: i,
					created_at: Date.now()
				};
				
				soldTickets.push(newTicket.description);
				lottery.tickets_sold.push(newTicket);
				lottery.tickets_for_draw.push(newTicket);
			}
		}
		// Add single ticket sold
		else {
			var newTicket = {
				description: descWithoutNumber + ' ' + numberRange,
				desc_without_number: descWithoutNumber,
				color: color,
				letter: letter,
				number: numberRange,
				created_at: Date.now()
			};
			
			soldTickets.push(newTicket.description);
			lottery.tickets_sold.push(newTicket);
			lottery.tickets_for_draw.push(newTicket);
		}

		lottery.save(function() {
			var response = { success: true, tickets: soldTickets };	
			res.json(response);
		});
	}); 
});

module.exports = router;
