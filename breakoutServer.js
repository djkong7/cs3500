var io;
var socket;
var numPlayers = 0;
var nextId = 0;
var gameId = 0;

exports.onConnect = function(io,socket){
    this.io = io;
    this.socket = socket;

    socket.on('move-left', function(data) {
        console.log('Player moved left', data);

        // send to other players
        socket.broadcast.emit('move-left', data);
    });

    socket.on('move-right', function(data) {
        console.log('Player moved right', data);

        // send to other players
        socket.broadcast.emit('move-right', data);
    });


    socket.emit('player-join', {message: 'You are the only player', only: numPlayers === 0, playerId: nextId++, gameId: gameId});
    numPlayers++;
    socket.broadcast.emit('player-join', {message: 'Another player joined', only: false});
    console.log(numPlayers);

    socket.on('move', function(data) {
        console.log('Player moved', data);

        // send to other players
        socket.broadcast.emit('move', data);
    });

    socket.on('stop', function(data) {
        console.log('Player stopped', data);

        // send to other players
        socket.broadcast.emit('stop', data);
    });

}

exports.onDisconnect = function (io,socket){
    numPlayers--;
    
    this.socket.broadcast.emit('player-leave', {message: 'The other player left', only: numPlayers === 1});
    console.log(numPlayers);
}