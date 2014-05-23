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
		res.redirect('/admin');
	});  
});

// view lottery page
router.get('/admin/lottery/:id', function(req, res) {
	var lotteryId = req.params.id;

	Lottery.findById(lotteryId, function(err, lottery) {
		if (typeof lottery == 'undefined') {
			res.redirect('/admin');
		}

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
			})
		});   
	}
	else {
		res.send('oops');
	}
});


module.exports = router;
