// Udemy lecture 5
var express = require('express');
var bodyParser = require('body-Parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

// Configfile inlezen
var config = require('./config');


var app = express();

// tbv socket.io = realtime verversen
var http = require('http').Server(app);
var io = require('socket.io')(http);


// connect naar database, naam staat in de config.js file
mongoose.connect(config.database, function(err) {
	if(err) {
		console.log(err);
	} else {
		console.log("connected naar de database");
	}	
});

// extended: true wil zeggen alle data komt door dus ook images of videos
// op false komt alleen een string door

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// morgan zorgt voor output naar console
app.use(morgan('dev'));


// tbv angular om de public files te renderen (css en javascript)
app.use(express.static(__dirname + '/public'));

// api aanroepen met url localhost:3000/api/signup, dus [refix hier is /api
// app, express zijn argumenten om ervoor te zorgen dat het geen locale vars worden
var api = require('./app/routes/api')(app, express, io);
app.use('/api', api);

// eerste interactie
// * geeft aan any route, dus ook bijvoorbeel localhost:3000/adres oid
app.get("*", function(req, res) {
	res.sendFile(__dirname + '/public/app/views/index.html');
});


// ipv app.listen nu http.listen ivm socket.io
http.listen(config.port, function(err) {
	if(err) {
		console.log(err);
	} else {
		console.log("luisteren naar port 3000");
	}
});

