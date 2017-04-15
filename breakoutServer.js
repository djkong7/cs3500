var io;
var socket;
var numPlayers = 0;
var playerId = 0;
var gameId = 1;
var rooms = [];
var joined = false;

/**
*
*/
exports.onConnect = function(sio,ssocket){
    io = sio;
    socket = ssocket;
    
    //Player setup
    socket.on('joinRoom', joinRoom);
    
    //Paddle controls
    socket.on('move-left',moveLeft);
    socket.on('move-right',moveRight);
    socket.on('stop',stop);
    
    
    
};

/**
*
*/
exports.onDisconnect = function (io,socket){
    if(numPlayers !== 0){
        numPlayers--;
    }
    
    socket.emit('player-leave', {message: 'The other player left', only: numPlayers === 1});
    console.log(numPlayers);
};

/**
*
*/
function moveLeft(data) {
    console.log('Player moved left', data);

    // send to other players
    //socket.broadcast.emit('move-left', data);
    this.emit('move-left', data);
};

/**
*
*/
function moveRight(data) {
    console.log('Player moved right', data);

    // send to other players
    //socket.broadcast.emit('move-right', data);
    this.emit('move-right', data);
};

/**
*
*/
function stop(data) {
    console.log('Player stopped', data);

    // send to other players
    this.broadcast.emit('stop', data);
};

/**
*
*/
function joinRoom(){
    //Give each socket a nickname to identify it
    //this.nickName = gameId;
    
    //Check all the game rooms to see if any need to be filled.
    //Fill it if it does

    this.join('testRoom');
    
    console.log('Joined "testRoom"');
    
    var roomPlayers = getClients('testRoom')
    console.log('Number of room players: ' + roomPlayers.length);
    
    /*for(var i = rooms[0]; i < rooms[rooms.length - 1]; i++){
        console.log('Room number: ' + i);
        var roomPlayers = io.sockets.clients(i.toString());
        console.log('Room players: ' + gamePlayers);
        if(roomPlayers === 1){
            this.join(i.toString());
            joined = true;
            gameId++;
        }
    }
    
    //If the player wasn't added to a room: create a new room, add them, and increment the gameId
    console.log('Joined: '+ joined)
    if(joined === false){
        this.join(gameId.toString());
        rooms.push(gameId);
    }*/
    
    //Let the player know that they are the only one
    //Increase the playerId
    this.emit('player-join', {message: 'You are the only player', only: numPlayers === 0, playerId: playerId++, gameId: gameId});
    
    //Send to everyone else that anoter player joined
    this.broadcast.emit('player-join', {message: 'Another player joined', only: false});
    
    numPlayers++;
    
    console.log('Number of players: ' + numPlayers);

};

//Kinda a last ditch effort
//Just found this online but it doesn't seem to work.
function getClients(roomId) {
  var res = [],
      room = io.sockets.adapter.rooms[roomId];
  if (room) {
    for (var id in room) {
      res.push(io.sockets.adapter.nsp.connected[id]);
    }
  }
  return res;
}