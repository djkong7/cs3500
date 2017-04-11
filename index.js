// Create an Express variable
var express = require('express');

// Create a new Express application
var app = express();

// Create an http server with Node's HTTP module. 
// Pass it the Express application, and listen on port 3000. 
var server = require('http').createServer(app);

app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/breakout.html');
});

app.listen(3000, function () {
    console.log('listening on *:3000');
});

// Instantiate Socket.IO hand have it listen on the Express/HTTP server
var io = require('socket.io').listen(server);
