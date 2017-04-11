var io;
var socket;

exports.initGame = function(io,socket){
    this.io = io;
    this.socket = socket;
    
    socket.emit('host', {message: 'You are the host', host: true})
}