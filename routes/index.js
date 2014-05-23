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

// create a new lottery
router.post('/admin/lottery/create', function(req, res) {
  var lotteryName = req.body.lottery_name;

  new Lottery({ 
    name: lotteryName, created_at: Date.now() 
  }).save(function(err, lottery, count) {
    res.redirect('/admin');
  });
  
});

module.exports = router;
