var io;
var socket;
var numPlayers;
var nextId = 0;

exports.initGame = function(io,socket){
    this.io = io;
    this.socket = socket;

    socket.on('move-left', function(data) {
        console.log("Player moved left", data);

        // send to other players
        socket.broadcast.emit('move-left', data);
    });

    socket.on('move-right', function(data) {
        console.log("Player moved right", data);

        // send to other players
        socket.broadcast.emit('move-right', data);
    });


    socket.emit('first', {message: 'You are the first player', first: true, playerId: nextId++})
}
