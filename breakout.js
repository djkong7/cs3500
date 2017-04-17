var BRICK_WIDTH = 50;
var BRICK_HEIGHT = 20;
var BRICK_ROWS = 5;
var PADDLE_WIDTH = 100;
var PADDLE_HEIGHT = 15;
var PADDLE_SPEED = 14;
var EDGE_COLOR = 'black';
var KEY_SPACE = 32;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var MAX_BOUNCE_ANGLE = Math.PI / 2;
var SCORE_BRICK_DESTROY = 1;
var SCORE_BALL_LOST = -5;

var canvas = null;
var c = null;
var players = [];
var local_player = null;
var other_player = null;
var clickTimeout = null;
var frame = 0;
var lastTime = null;

var roomId = 0;
var roomSpeed = 0;
var only = false;
var disconnect = false;
var socket = null;
var sentLeft = false;
var sentRight = false;

function Player(id, name) {
    this.id = id;
    this.name = name;
    this.paddle = null;
    this.bricks = null;
    this.balls = null;
    this.score = 0;
    this.lastBallId = 0;
    this.ballIncrement = 1;
}

function removeBallAndUpdateScore(player, ball) {
    // remove ball from player
    player.balls.splice(player.balls.indexOf(ball), 1);

    // reduce score
    player.score += SCORE_BALL_LOST;

    // new ball for player
    newBall(player);
}

/** Draw the canvas and do game logic
 */
function drawCanvas(now) {
    var w = canvas.width;
    var h = canvas.height;
    var gw = canvas.gameWidth;
    var gh = canvas.gameHeight;
    var bricks = null;
    var balls = null;
    var hitPlayerSide = false;
    var collidedBricks = [];
    var brickIndex = 0;
    var deltatime = 1;

    now /= 100;

    if (lastTime != null) {
        deltatime = now - lastTime;
    }

    lastTime = now;

    c.strokeStyle = 'gray';
    c.fillStyle = '#EEE';

    c.fillRect(0, 0, w, h); // clears

    // draw everything at an offset
    c.save();
    c.translate(canvas.offX, canvas.offY);

    // draw game region border
    c.strokeStyle = 'green';
    c.rect(0, 0, gw, gh);
    c.stroke();

    for (var i = 0; i < players.length; ++i) {
        player = players[i];
        balls = player.balls;
        bricks = player.bricks;
        paddle = player.paddle;

        // TODO: Collide everything, update everything, then draw everything
        // TODO: ACCOUNT FOR FRAMERATE

        // handle collisions
        balls.forEach(function (ball) {
            hitPlayerSide = false;
            if (!ball.attachedPaddle) {
                for (var j = 0; j < players.length; ++j) {
                    collidedBricks = collideBallAndPlayerBricks(ball, player, players[j].bricks);
                    if (player == local_player) {
                        for (var k = 0; k < collidedBricks.length; ++k) {
                            brickIndex = players[j].bricks.indexOf(collidedBricks[k]);
                            player.score += SCORE_BRICK_DESTROY;
                            collidedBricks[k].valid = false;
                            socket.emit('update-brick', {
                                roomId: roomId,
                                ownerId: players[j].id,
                                index: brickIndex,
                                valid: false,
                            });
                        }
                    }
                    collideBallAndPlayerPaddle(ball, players[j].paddle);
                }
                hitPlayerSide = collideBallAndScreen(ball, player == local_player);
            }
            if (hitPlayerSide) {
                // if local, update other players that our ball was deleted
                if (player == local_player) {
                    removeBallAndUpdateScore(player, ball);
                    socket.emit('update-ball', {
                        roomId: roomId,
                        ballId: ball.id,
                        x: null,
                        y: null,
                    });
                }
            } else {
                ball.update(deltatime);
                ball.draw(c);
            }

            if (!ball.attachedPaddle) {
                if (frame % 5 == 0) {
                    // send update for ball position
                    socket.emit('update-ball', {
                        roomId: roomId,
                        ballId: ball.id,
                        x: ball.x,
                        y: ball.y,
                        vx: ball.vx,
                        vy: ball.vy,
                    });
                }
            }

        });

        // draw bricks
        for (var j = 0; j < bricks.length; ++j) {
            bricks[j].draw(c);
        }

        // draw paddles
        paddle.text = player.score;
        paddle.update(deltatime);
        paddle.draw(c);
    }

    // restore offset translation
    c.restore();

    if (only) {
        c.fillStyle = 'rgba(10,10,10,.8)';
        c.fillRect(0, 0, w, h);

        c.fillStyle = 'white';
        c.font = 'bold 2em sans-serif';
        c.textAlign = 'center';
        if (disconnect) {
            c.fillText('Opponent disconnected', w / 2, h / 2 - 25);
            c.fillText('Refresh for new opponent', w / 2, h / 2 + 25);
        } else {
            c.fillText('Waiting for an opponent', w / 2, h / 2);
        }
    }

    frame++;
    raf = window.requestAnimationFrame(drawCanvas);
}

function getCanvasSize() {
    var borderSize = 2;
    var w = window.innerWidth - borderSize;
    var h = window.innerHeight - borderSize;
    return {w: w, h: h};
}


/** Resize the canvas to the window size
 */
function resizeCanvas() {
    var size = getCanvasSize();
    canvas.width = size.w;
    canvas.height = size.h;

    // set canvas offsets (to center image)
    canvas.offX = canvas.width / 2 - canvas.gameWidth / 2;
    canvas.offY = canvas.height / 2 - canvas.gameHeight / 2;
}

/** Create a ball and attach it to the players paddle
 */
function newBall(player) {
    var ballId = player.lastBallId + player.ballIncrement;
    player.lastBallId = ballId;
    var ball = new Ball(ballId, 0, 0, roomSpeed, 6, 'green');
    player.paddle.attachBall(ball, player == local_player);

    player.balls.push(ball);
}

/** Create a player and return it
 */
function createPlayer() {
    var player = new Player(-1, 'Steven');
    player.paddle = new Paddle(
        -100,
        -100,
        0, 0);

    player.balls = [];
    player.bricks = [];

    return player;
}

/** Move the players paddle towards the given coords
 */
function movePaddle(player, x, y) {
    if (player == local_player) {
        x -= canvas.offX;
    }
    player.paddle.targetX = x - PADDLE_WIDTH / 2;

    // tell others we are moving
    if (player == local_player) {
        socket.emit('move-paddle', {
            playerId: local_player.id,
            roomId: roomId,
            x: x,
        });
    }
}

function addBricks(player, isLocal) {
    // add bricks
    var num_bricks = Math.floor(canvas.gameWidth / BRICK_WIDTH);
    var x_offset = (canvas.gameWidth - num_bricks * BRICK_WIDTH) / 2;
    var y;
    if (isLocal) {
        y = canvas.gameHeight / 2 + 10;
    } else {
        y = canvas.gameHeight / 2 - BRICK_HEIGHT - 10;
    }

    for (var j = 0; j < BRICK_ROWS; ++j) {
        for (var i = 0; i < num_bricks; ++i) {
            var b = new Brick(x_offset + i * BRICK_WIDTH, y);
            //console.log("Added brick to (" + i + ", 100");
            // special blocks
            if (i == 0 || i == num_bricks - 1) {
                b.color = 'gold';
            }
            player.bricks.push(b);
        }
        if (isLocal) {
            y += BRICK_HEIGHT;
        } else {
            y -= BRICK_HEIGHT;
        }
    }
}

function initPlayersAndCanvas(canvasId) {
    canvas = document.getElementById(canvasId);
    c = canvas.getContext('2d');
    resizeCanvas();

    local_player = createPlayer();
    players.push(local_player);

    other_player = createPlayer();
    players.push(other_player);

    drawCanvas();
}

/** Initialize the game
 */
function initGame(w, h) {
    console.log('adding event listeners');

    // set canvas size
    canvas.gameWidth = w;
    canvas.gameHeight = h;

    resizeCanvas();

    // create player balls
    newBall(local_player);
    newBall(other_player);

    // set paddle positions
    local_player.paddle.x = canvas.gameWidth / 2 - PADDLE_WIDTH / 2;
    other_player.paddle.x = canvas.gameWidth / 2 - PADDLE_WIDTH / 2;
    local_player.paddle.y = canvas.gameHeight - PADDLE_HEIGHT - 50;
    other_player.paddle.y = 50;

    // add bricks now
    addBricks(local_player, true);
    addBricks(other_player, false);

    // add event listeners for canvas

    window.addEventListener('resize', function (event) {
        //console.log('on resize');
        resizeCanvas();
    });

    //If the player is the only, draw game but don't attach listeners to wait until
    //another player connects.
    window.addEventListener('mousemove', function (event) {
        if (!only) {
            movePaddle(local_player, event.offsetX, event.offsetY);
        }
    });

    window.addEventListener('touchstart', function (event) {
        if (!only) {
            var touch = event.changedTouches[event.changedTouches.length - 1];
            var x = touch.pageX;
            var y = touch.pageY;

            if (clickTimeout == null) {
                clickTimeout = setTimeout(function () {
                    // single click
                    clickTimeout = null;
                    movePaddle(local_player, x, y);
                }, 500);
            } else {
                clearTimeout(clickTimeout);
                // double click
                local_player.paddle.releaseBall();
                socket.emit('release-ball', {
                    roomId: roomId
                });
            }
        }
    });

    window.addEventListener('touchmove', function (event) {
        if (!only) {
            var touch = event.changedTouches[event.changedTouches.length - 1];
            movePaddle(local_player, touch.pageX, touch.pageY);
        }
    });

    window.addEventListener('keydown', function (event) {
        if (!only) {
            if (event.keyCode == KEY_LEFT) {
                local_player.paddle.moveLeft();
                if (!sentLeft) {
                    socket.emit('move-left', {
                        player: local_player.id,
                        roomId: roomId
                    });
                    sentLeft = true;
                }
            } else if (event.keyCode == KEY_RIGHT) {
                local_player.paddle.moveRight();
                if (!sentRight) {
                    socket.emit('move-right', {
                        player: local_player.id,
                        roomId: roomId
                    });
                    sentRight = true;
                }
            } else if (event.keyCode == KEY_SPACE) {
                local_player.paddle.releaseBall();
                socket.emit('release-ball', {
                    roomId: roomId
                });
                event.preventDefault();
            } else {
                console.log(event.keyCode);
            }
        }
    });

    window.addEventListener('keyup', function (event) {
        sentLeft = false;
        sentRight = false;
        if (event.keyCode == KEY_LEFT || event.keyCode == KEY_RIGHT) {
            local_player.paddle.stop();
            socket.emit("move-stop", {
                x: local_player.paddle.x,
                roomId: roomId,
            });
        }
    });
}

/** Toggle fullscreen for the canvas
 *
 * from https://developers.google.com/web/fundamentals/native-hardware/fullscreen/
 */
function toggleFullscreen() {
    var doc = window.document;
    var docEl = doc.documentElement;
    var img = document.getElementById('img-fullscreen');

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
        img.src = 'images/return_from_full_screen.png';
        img.alt = 'Return from full screen';
    } else {
        cancelFullScreen.call(doc);
        img.src = 'images/full_screen.png';
        img.alt = 'Go full screen';
    }
}

function setup() {
    socket = io.connect('/');

    socket.on('disconnect', function (msg) {
        console.log("server disconnect: " + msg);
        socket.disconnect();
        disconnect = true;
        only = true;
    });

    // Initialize the players
    initPlayersAndCanvas('game-canvas');

    var size = getCanvasSize();

    //Request to join a room
    socket.emit('room-join', {
        w: size.w,
        h: size.h,
    });

    //Gets the roomId from the server and stores it
    //Requests the status of the room
    socket.on('room-id', function (msg) {
        console.log(msg);
        roomId = msg.roomId;
        local_player.id = msg.playerId;
        console.log("New player id is: " + msg.playerId);
        console.log(local_player);
        socket.emit('room-status', {
            roomId: roomId,
        });
    });

    socket.on('player-join', function (msg) {
        console.log(msg);
        only = msg.only;
        disconnect = false;

        if (!only) {
            if (local_player.id == msg.player1Id) {
                other_player.id = msg.player2Id;
                local_player.ballIncrement = 1;
                other_player.ballIncrement = -1;
            } else {
                other_player.id = msg.player1Id;
                local_player.ballIncrement = -1;
                other_player.ballIncrement = 1;
            }
            console.log("Other player id: " + other_player.id);

            roomSpeed = msg.speed;

            //Initialize the game
            initGame(msg.w, msg.h);
        }
    });

    socket.on('player-leave', function (msg) {
        console.log(msg);
        only = msg.only;
        disconnect = msg.disconnect;
        if (disconnect) {
            console.log("Disconnecting");
            socket.disconnect();
        }
    });

    socket.on('move-paddle', function(data) {
        if (data.playerId == other_player.id) {
            //console.log('Player ' + data.playerId + ' is moving paddle to ' + data.x);
            movePaddle(other_player, data.x, 0);
        }
    });

    socket.on('move-left', function (data) {
        if (data.playerId != local_player.id) {
            other_player.paddle.moveLeft();
        }
        console.log("Player moved left", data);
    });

    socket.on('move-right', function (data) {
        if (data.playerId != local_player.id) {
            other_player.paddle.moveRight();
        }
        console.log("Player moved right", data);

    });

    socket.on('move-stop', function (data) {
        if (data.playerId != local_player.id) {
            other_player.paddle.stop();
            other_player.paddle.x = data.x;
        }
        console.log("Player stopped", data);
    });

    socket.on('release-ball', function (data) {
        if (data.playerId != local_player.id) {
            other_player.paddle.releaseBall();
            console.log("Player released ball ", data);
        }
    });

    socket.on('update-ball', function(data) {
        if (data.playerId != local_player.id) {
            var ball = null;
            for (var i = 0; i < other_player.balls.length; ++i) {
                if (other_player.balls[i].id == data.ballId) {
                    ball = other_player.balls[i];
                    break;
                }
            }
            if (ball) {
                if (data.x == null || data.y == null) {
                    // ball was deleted
                    removeBallAndUpdateScore(other_player, ball);
                } else {
                    // update ball
                    // TODO: this info is slightly behind!
                    var x = ball.x;
                    var y = ball.y;
                    ball.x = data.x + data.vx;
                    ball.y = canvas.gameHeight - data.y - data.vy;
                    ball.vx = data.vx;
                    ball.vy = -data.vy;

                    console.log("Diff x: " + Math.floor(ball.x - x) + ", Diff y: " + Math.floor(ball.y - y));
                }
            }
        }
    });

    socket.on('update-brick', function(data) {
        //console.log('update-brick', data);
        if (data.playerId != local_player.id) {
            var brick = null;
            if (data.ownerId == other_player.id) {
                brick = other_player.bricks[data.index];
            } else if (data.ownerId == local_player.id) {
                //console.log("one of our bricks was hit!");
                brick = local_player.bricks[data.index];
            }

            if (brick) {
                brick.valid = data.valid;
                other_player.score += SCORE_BRICK_DESTROY;
            }
        }
    });

}
