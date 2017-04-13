var gameIo;
var gameSocket;
var numPlayers = 0;
var nextId = 0;
var gameId = 0;

exports.onConnect = function(io,socket){
    gameIo = io;
    gameSocket = socket;

    gameSocket.on('move-left', function(data) {
        console.log("Player moved left", data);

        // send to other players
        gameSocket.broadcast.emit('move-left', data);
    });

    gameSocket.on('move-right', function(data) {
        console.log("Player moved right", data);

        // send to other players
        gameSocket.broadcast.emit('move-right', data);
    });

    gameSocket.emit('player-join', {message: 'You are the only player', only: numPlayers === 0, playerId: nextId++, gameId: gameId});
    numPlayers++;
    gameSocket.broadcast.emit('player-join', {message: 'Another player joined', only: false});
    console.log(numPlayers);
}

exports.onDisconnect = function (){
    numPlayers--;
    gameSocket.broadcast.emit('player-leave', {message: 'The other player left', only: numPlayers === 1});
    console.log(numPlayers);
}