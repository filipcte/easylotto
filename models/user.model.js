var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema   = mongoose.Schema;

/**
 * User Schema
 */
var userSchema = new Schema({
	email: {
		type: String,
		trim: true
	},
	password: {
		type: String,
	},
	created_at: {
		type: Date,
		default: Date.now
	}
});

// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
 return bcrypt.compareSync(password, this.password);
};

// generate a hash as a static method
userSchema.statics.generatePassHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

mongoose.model('User', userSchema);