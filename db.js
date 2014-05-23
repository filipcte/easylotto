var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
 
var lotterySchema = new Schema({
    name    : String,
    created_at : Date
});
 
mongoose.model('Lottery', lotterySchema);
mongoose.connect('mongodb://localhost/lotto');