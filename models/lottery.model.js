var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
 
var lotterySchema = new Schema({
    name: String,
    created_at: {
      type: Date,
      default: Date.now
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    }
});
 
mongoose.model('Lottery', lotterySchema);
//mongoose.connect('mongodb://localhost/lotto');