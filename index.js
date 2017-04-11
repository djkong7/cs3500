const PORT = 3000;

// Create an Express variable
const express = require('express');

// Create a new Express application
const app = express();

// Create an http server with Node's HTTP module. 
const server = require('http').Server(app);

// Setup default directory for client (used for src='' in html file)
app.use(express.static(__dirname));

// Send the html file to the client
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/breakout.html');
});

// Instantiate Socket.IO hand have it listen on the Express/HTTP server
const io = require('socket.io').listen(server);

io.on('connection', function (socket) {
    console.log('a user connected');
});

// Listen on port 3000
app.listen(PORT, function () {
    //console.log('listening on *:3000');
});
