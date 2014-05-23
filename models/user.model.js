var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

/**
 * User Schema
 */
var UserSchema = new Schema({
	email: {
		type: String,
		trim: true,
		default: '',
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	password: {
		type: String,
		default: '',
	},
	created_at: {
		type: Date,
		default: Date.now
	}
});

/**
 * Hook a pre save method to hash the password
 */
// UserSchema.pre('save', function(next) {
// 	if (this.password && this.password.length > 6) {
// 		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
// 		this.password = this.hashPassword(this.password);
// 	}

// 	next();
// });

/**
 * Create instance method for hashing a password
 */
// UserSchema.methods.hashPassword = function(password) {
// 	if (this.salt && password) {
// 		return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
// 	} else {
// 		return password;
// 	}
// };

/**
 * Create instance method for authenticating user
 */
// UserSchema.methods.authenticate = function(password) {
// 	return this.password === this.hashPassword(password);
// };

/**
 * Find possible not used username
 */
// UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
// 	var _this = this;
// 	var possibleUsername = username + (suffix || '');

// 	_this.findOne({
// 		username: possibleUsername
// 	}, function(err, user) {
// 		if (!err) {
// 			if (!user) {
// 				callback(possibleUsername);
// 			} else {
// 				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
// 			}
// 		} else {
// 			callback(null);
// 		}
// 	});
// };

mongoose.model('User', UserSchema);