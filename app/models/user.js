var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');


// select: false betekent niet meenemen in selectiefilter
var UserSchema = new Schema({
	name: String,
	username: {type: String, required: true, index: { unique: true}},
	password: {type: String, required: true, select: false},
});


// password hashing
// als er next staat, dan is het doorgaan met de volgende route (api)
UserSchema.pre('save', function(next) {
// this is refering to the UserSchema object
	var user = this;

	if (!user.isModified('password')) return next();

	bcrypt.hash(user.password, null, null, function(err, hash) {
		if(err) return next(err);

		user.password = hash;
		next();
	});

});


// Vergelijken van passwords, de methodnaam is zelfgekozen: comparePassword
UserSchema.methods.comparePassword = function(password) {

		var user = this;
		return bcrypt.compareSync(password, user.password);

}

module.exports = mongoose.model('User', UserSchema);

