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
      desc_without_number: String,
      color: String,
      letter: String,
      number: String,
      created_at: Date
    }],

    tickets_for_draw: [{
      description: String,
    }],

    drawings: [{
      winning_ticket: String,
      created_at: Date    
    }],

    created_at: {
      type: Date,
      default: Date.now
    }

});
 
mongoose.model('Lottery', lotterySchema);