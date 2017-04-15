var io;
var socket;
var numPlayers = 0;
var playerId = 0;
var roomId = 0;
var rooms = [];
var joined = false;

/**
 *
 */
exports.onConnect = function (sio, ssocket) {
    io = sio;
    socket = ssocket;

    //Player setup
    socket.on('room-join', roomJoin);
    socket.on('room-status', roomStatus);
    
    //Paddle controls
    socket.on('move-left', moveLeft);
    socket.on('move-right', moveRight);
    socket.on('move-stop', moveStop);



};

/**
 *
 */
function roomJoin() {
    //Give the socket a nickname
    this.nickname = playerId;
    playerId ++;
    //Check all the game rooms to see if any need to be filled.
    //Fill it if it does
    
    joined = false;
    
    //Check each room to see if it has only one player
    //If it does, join that room
    for(var i = 0; i < rooms.length; i++){
        if(rooms[i].numPlayers === 1){
            rooms[i].join(this);
            joined = true;
        }
    }
    
    //console.log(joined);
    //Create a new room and join it if there were
    //no open rooms
    if(joined === false){
        rooms.push(new Room(roomId));
        rooms[rooms.length-1].join(this);
    }
    
    //Send the roomid to the client
    this.emit('room-id', {roomId: roomId++});
    console.log(rooms);
};

/**
 *
 */
function roomStatus(data){
    console.log('The client data is: ' + data.roomId);
    console.log('Get status of room: ' + data.roomId);
    for(var i = 0; i < rooms.length; i++){
        console.log('This rooms room id is: ' + rooms[i].roomId);
        if(data.roomId == rooms[i].roomId){
            console.log('Match');
            if(rooms[i].numPlayers === 1){
                //Let the player know that they are the only one
                //Increase the playerId
                this.in(data.roomId).emit('player-join', {
                    message: 'You are the only player',
                    only: true,
                    playerId: playerId,
                });
            }else{
                //Send to everyone else that anoter player joined
                this.in(data.roomId).emit('player-join', {
                    message: 'Another player joined',
                    only: false
                });
            }
        }
    }
    
    /*//Let the player know that they are the only one
    //Increase the playerId
    this.emit('player-join', {
        message: 'You are the only player',
        only: numPlayers === 0,
        playerId: playerId++,
        roomId: roomId
    });

    //Send to everyone else that anoter player joined
    this.broadcast.emit('player-join', {
        message: 'Another player joined',
        only: false
    });*/

    numPlayers++;

    console.log('Number of players: ' + numPlayers);

};

/**
 *
 */
exports.onDisconnect = function (sio, ssocket) {
    if (numPlayers !== 0) {
        numPlayers--;
    }

    socket.emit('player-leave', {
        message: 'The other player left',
        only: numPlayers === 1
    });
    console.log('Number of players: ' + numPlayers);
    
    console.log(rooms);
    for(var room in rooms){
        console.log(room);
        if(room.players[0] == ssocket.nickname || room.players[1] == ssocket.nickname){
            room.disconnect(socket.nickname);
        }
            
    }
};

/**
 *
 */
function moveLeft(data) {
    console.log('Player moved left', data);

    // send to other players
    socket.broadcast.emit('move-left', data);
};

/**
 *
 */
function moveRight(data) {
    console.log('Player moved right', data);

    // send to other players
    socket.broadcast.emit('move-right', data);
};

/**
 *
 */
function moveStop(data) {
    console.log('Player stopped', data);

    // send to other players
    this.broadcast.emit('stop', data);
};


function Room(roomId) {
    this.roomId = roomId.toString();
    this.numPlayers = 0;
    this.players = [];
};

Room.prototype.join = function(socket){
    socket.join(this.roomId);
    this.numPlayers++;
    if(this.players[0] == null){
        this.players[0] = socket.nickname;
    }else{
        this.players[1] = socket.nickname;
    }
};

Room.prototype.disconnect = function(nickname){
    if(this.players[0] == nickname){
        this.players.splice(0,1);
    }else{
        this.players.splice(1,1);
    }
}
