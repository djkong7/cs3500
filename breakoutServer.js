var io;
var socket;
var numPlayers;

exports.initGame = function(io,socket){
    this.io = io;
    this.socket = socket;
    
    
    socket.emit('first', {message: 'You are the first player', first: true})
}