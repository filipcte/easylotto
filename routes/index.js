var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Lottery = mongoose.model('Lottery');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Lotto' });
});

router.get('/admin', function(req, res) {
  Lottery.find(function(err, lotteries, count) {
    res.render('admin', { lotteries: lotteries })
  }); 
});

router.post('/addlottery', function(req, res) {
  var lotteryName = req.body.lottery_name;

  new Lottery({ 
    name: lotteryName, created_at: Date.now() 
  }).save(function(err, lottery, count) {
    res.location('admin');
    res.redirect('admin');
  });
  
});

module.exports = router;
