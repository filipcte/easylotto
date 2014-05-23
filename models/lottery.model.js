var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
 
var lotterySchema = new Schema({
    name: String,

    // open|draw|closed
    status: {
      type: String,
      default: 'open'
    },
    
    tickets_sold: [{
      description: String,
      created_at: Date
    }],

    drawings: [{
      winning_ticket: String,
      created_at: Date    
    }],

    created_at: {
      type: Date,
      default: Date.now
    }

    // user: {
    //   type: Schema.ObjectId,
    //   ref: 'User',
    //   default: 1
    // }
});
 
mongoose.model('Lottery', lotterySchema);