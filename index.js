#!/usr/bin/env nodejs

var express = require('express'); // Create an Express variable
var app = express(); // Create a new Express application
var server = require('http').Server(app); // Create an http server with Node's HTTP module. 
var io = require('socket.io')(server); // Instantiate Socket.IO and have it listen on the Express/HTTP server
var port = process.env.PORT || 3000;
var game = require('./breakoutServer');
//console.log(game);

// Setup default directory for client (used for src='' in html file)
app.use(express.static(__dirname));

// Send the html file to the client
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/breakout.html');
});

// Executes when a client connects
io.sockets.on('connection', function (socket) {
    console.log('a user connected');
    //Initialize the game on the server
    game.onConnect(io,socket);
    socket.on('disconnect',function(){
        console.log('a user disconnected');
        game.onDisconnect(io,socket);
    });
});

// Listen on port 3000
server.listen(port, function () {
    console.log('listening on :' + port);
});



