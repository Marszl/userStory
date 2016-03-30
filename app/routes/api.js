// Let op: server steeds restarten na het doen van aanpassingen in de files
//

var User = require('../models/user');
var Story = require('../models/story');
var config = require('../../config');

var secretKey = config.secretKey;


var jsonwebtoken = require('jsonwebtoken');

// function Token aanmaken, je bepaalt zelf wat je er allemaal in wilt stoppen
function createToken(user) {

	var token = jsonwebtoken.sign({
		id: user._id,
		name: user.name,
		username: user.username
	}, secretKey, {
		expiresInMinute: 1440
	});

	return token;
}	

module.exports = function(app, express, io){

	var api = express.Router();

	// Een blok om alle stories op te halen
	api.get('/all_stories', function(req,res) {
		Story.find({}, function(err, stories) {

			if(err) {
				res.send(err);
				return;
			}
			res.json(stories);
		});
	});

	api.post('/signup', function(req, res){
 //body refereert aan bodyparser, haalt de url uiteen
		var user = new User({
			name: req.body.name,
			username: req.body.username,
			password: req.body.password
		});

		var token = createToken(user);

		// save in database
		user.save(function(err){
			if(err) {
				res.send(err);
				return;
			}

			res.json({
				success: true,
				message: 'User is aangemaakt !',
				token: token
			});
		});
	});

	// get api, want we gaan checken welke users er in de database zitten
	// retrieval functie dus
	// /users  is de route van de api call

	api.get('/users', function(req, res) {

		// find is a mongoose function, for now a find all
		User.find({}, function(err, users) {
			if(err) {
				res.send(err);
				return;
			}

			res.json(users);

		});

	});


	api.post('/login', function(req, res) {
		// findOne is used for finding a specific object
		User.findOne({ 
			username: req.body.username
		}).select('name username password').exec(function(err, user) {
			// als er een fout voordat laat m zien
			if(err) throw err;

			// als de user niet bestaat:
			if (!user) {

				res.send({ message: "Deze user ken ik niet"});

			// als user bestaat dan password vergelijken, zie functie
			// 	comparePassword in user.js
			} else if (user){

				var validPassword = user.comparePassword(req.body.password);

				// check of password valid is
				if (!validPassword){

					res.send({ message: "Invalid Password !!"});

				} else {

					// everything OK, so let's make a token
					var token = createToken(user);

					res.json({
						success: true,
						message: "Succesfully ingelogd !",
						token: token
					});


				}
			}
		});
	});



	// creeren van de middleware, oftewel bepalen of je mag worden toegelaten

	api.use(function(req, res, next) {

		console.log("Iemand wil iets met onze App");

		// de || staat voor 'or', we weten eigenljk niet waar we t token vamdaan halen 
		var token = req.body.token || req.param('token') || req.headers['x-access-token']

		// check if token exists

		if(token) {

			jsonwebtoken.verify(token, secretKey, function(err, decoded) {

				if(err) {
					res.status(403).send({ success: false, message: "toegang geweigerd, failed to authenticate user"});
						
				} else {

					req.decoded = decoded;

					next();
				}
			});
		} else {

			res.status(403).send({ success: false, message: "toegang geweigerd, no token provided !"});

		}
	});

	// Als je hier wilt komen moet je dus een valid Token providen
	// we starten op de 'home' route oftewel '/'

	//api.get('/', function(req, res) {
	//	res.json("Hallo wereld, op de home route");

	//});


	// multiple http methods on a single route
	api.route('/')

		.post(function(req, res) {

			var story = new Story({
				creator: req.decoded.id,
				content: req.body.content,

			});

			story.save(function(err, newStory) {
				if(err) {
					res.send(err);
					return
				}
				io.emit('story', newStory);
				res.json({message: "New story created"});
			});
		}) 

		.get(function(req, res) {
			Story.find({ creator: req.decoded.id }, function(err, stories) {
				if(err) {
					res.send(err);
					return;
				}

				res.send(stories);

			});
		});


	// an API just for angular to fetch te userdata
	api.get('/me', function(req, res) {
		res.send(req.decoded);
	});

	return api

}