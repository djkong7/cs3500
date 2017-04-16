var io;
var socket;
var playerId = 0;
var roomId = 0;
var rooms = [];
var joined = false;
var joinedRoomId = 0;
var nextRoomId = 0;

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
    socket.on('move-paddle', movePaddle);
    socket.on('move-left', moveLeft);
    socket.on('move-right', moveRight);
    socket.on('move-stop', moveStop);

    console.log("hooked up events");
};

/**
 *
 */
function roomJoin() {
    //Give the socket a nickname
    this.nickname = playerId;
    playerId++;

    joined = false;

    //Check each room to see if it has none or one player
    //If it does, join that room
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].numPlayers === 1 || rooms[i].numPlayers === 0) {
            rooms[i].join(this);
            joinedRoomId = rooms[i].roomId;
            joined = true;
            break;
        }
    }

    //Create a new room and join it if there were no open rooms
    if (joined === false) {
        var room = new Room(nextRoomId++);
        room.join(this);
        joinedRoomId = room.roomId;
        rooms.push(room);
        console.log("Created new room");
    } else {
        console.log("Found old room");
    }

    console.log('Player ' + playerId + ' has joined room ' + joinedRoomId + ' (Total rooms: ' + rooms.length + ')');

    //Send the roomid to only the new client
    io.to(this.id).emit('room-id', {
        roomId: joinedRoomId,
        playerId: this.nickname,
    });
};

/**
 * Get the status of the room and send it to the client
 */
function roomStatus(data) {
    for (var i = 0; i < rooms.length; i++) {
        if (data.roomId == rooms[i].roomId) {
            if (rooms[i].numPlayers === 1 || rooms[i].numPlayers === 0) {
                // Let the player know that they are the only one
                io.sockets.in(data.roomId).emit('player-join', {
                    message: 'You are the only player',
                    only: true,
                });
            } else {
                // Let the player know that they have an opponent
                io.sockets.in(data.roomId).emit('player-join', {
                    message: 'Another player joined',
                    only: false,
                    player1Id: rooms[i].players[0],
                    player2Id: rooms[i].players[1],
                });
            }
        }
    }
};

/**
 * When a client disconnects, let the other player in the room know that they disoconnected
 */
exports.onDisconnect = function (sio, ssocket) {
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].players[0] == ssocket.nickname || rooms[i].players[1] == ssocket.nickname) {

            console.log('Players have left room ' + rooms[i].roomId);

            io.sockets.in(rooms[i].roomId).emit('player-leave', {
                message: 'The other player left',
                only: true,
                disconnect: true
            });
            //rooms[i].disconnect(ssocket.nickname);
            rooms.splice(i,1);
            break;
        }
    }
};

function movePaddle(data) {
    //console.log('Player ' + data.playerId + ' is moving paddle to ' + data.x);

    io.sockets.in(data.roomId).emit('move-paddle', data);
}

/**
 *
 */
function moveLeft(data) {
    console.log('Player moved left', data);

    // send to other players
    io.sockets.in(data.roomId).emit('move-left', data);
};

/**
 *
 */
function moveRight(data) {
    console.log('Player moved right', data);

    // send to other players
    io.sockets.in(data.roomId).emit('move-right', data);
};

/**
 *
 */
function moveStop(data) {
    console.log('Player stopped', data);

    // send to other players
    io.sockets.in(data.roomId).emit('move-stop', data);
};


function Room(roomId) {
    this.roomId = roomId.toString();
    this.numPlayers = 0;
    this.players = [];
};

/**
 * Handles joining the room
 */
Room.prototype.join = function (socket) {
    socket.join(this.roomId);
    this.numPlayers++;
    if (this.players[0] == null) {
        this.players[0] = socket.nickname;
    } else {
        this.players[1] = socket.nickname;
    }
};

/**
 * Remove the client from the room object
 */
Room.prototype.disconnect = function (nickname) {
    this.numPlayers--;
    if (this.players[0] == nickname) {
        this.players.splice(0, 1);
    } else {
        this.players.splice(1, 1);
    }
}
