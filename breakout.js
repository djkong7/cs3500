var BRICK_WIDTH = 50;
var BRICK_HEIGHT = 20;
var BRICK_ROWS = 5;
var PADDLE_WIDTH = 100;
var PADDLE_HEIGHT = 15;
var PADDLE_SPEED = 7;
var BALL_SPEED = 7;
var EDGE_COLOR = "black";
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
var next_player_id = 0;

var first = false;
var global = null;

var socket;

function Player(id, name) {
    this.id = id;
    this.name = name;
    this.paddle = null;
    this.bricks = null;
    this.balls = null;
    this.score = 0;
}

/** Draw the canvas and do game logic
 */
function drawCanvas(now) {
    var w = canvas.width;
    var h = canvas.height;
    var bricks = null;
    var balls = null;
    var hit_bottom = false;

    c.strokeStyle = "gray";
    c.fillStyle = "#EEE";

    c.fillRect(0, 0, w, h); // clears

    for (var i = 0; i < players.length; ++i) {
        player = players[i];
        balls = player.balls;
        bricks = player.bricks;
        paddle = player.paddle;

        // TODO: Collide everything, update everything, then draw everything

        // handle collisions
        balls.forEach(function (ball) {
            if (!ball.attachedPaddle) {
                for (var j = 0; j < players.length; ++j) {
                    collideBallAndPlayerBricks(ball, player, players[j].bricks);
                    collideBallAndPlayerPaddle(ball, players[j].paddle);
                }
                hit_bottom = collideBallAndScreen(ball, player == local_player);
            }
            if (hit_bottom) {
                // remove ball from player
                player.balls.splice(player.balls.indexOf(ball), 1);

                // reduce score
                player.score += SCORE_BALL_LOST;

                // new ball for player
                newBall(player);
            } else {
                ball.update();
                ball.draw(c);
            }
        });

        // draw bricks
        for (var j = 0; j < bricks.length; ++j) {
            bricks[j].draw(c);
        }

        // draw paddles
        paddle.text = player.score;
        paddle.update();
        paddle.draw(c);
    }

    raf = window.requestAnimationFrame(drawCanvas);
}

/** Resize the canvas to the window size
 */
function resizeCanvas() {
    var borderSize = 2;
    canvas.width = window.innerWidth - borderSize;
    canvas.height = window.innerHeight - borderSize;
}

/** Create a ball and attach it to the local players paddle
 */
function newBall(player) {
    var ball = new Ball(0, 0, BALL_SPEED, 6, 'green');
    player.paddle.attachBall(ball);

    player.balls.push(ball);
}

/** Create a player and return it
 */
function createPlayer() {
    var player = new Player(next_player_id++, "Steven");
    player.paddle = new Paddle(
        canvas.width / 2 - PADDLE_WIDTH / 2,
        canvas.height - PADDLE_HEIGHT - 50,
        0, 0);

    player.balls = [];
    player.bricks = [];

    return player;
}

/** Move the local players paddle towards the given coords
 */
function movePaddle(x, y) {
    local_player.paddle.targetX = x - PADDLE_WIDTH / 2;
}

function addBricks(player, isLocal) {
    // add bricks
    var num_bricks = Math.floor(canvas.width / BRICK_WIDTH);
    var x_offset = (canvas.width - num_bricks * BRICK_WIDTH) / 2;
    var y;
    if (isLocal) {
        y = canvas.height / 2 + 10;
    } else {
        y = canvas.height / 2 - BRICK_ROWS * BRICK_HEIGHT - 10;
    }
    console.log("Made " + num_bricks + " bricks");
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
        y += BRICK_HEIGHT;
    }
}

/** Initialize the game
 */
function initGame(bodyId, canvasId) {
    console.log('added event listener');

    canvas = document.getElementById(canvasId);
    c = canvas.getContext('2d');
    resizeCanvas();

    window.addEventListener('resize', function (event) {
        //console.log("on resize");
        resizeCanvas();
    });

    var player = createPlayer();
    local_player = player;
    newBall(player);
    addBricks(player, true);
    players.push(player);

    var player2 = createPlayer();
    player2.paddle.y = 50;
    newBall(player2);
    addBricks(player2, false);
    players.push(player2);

    //If the player is the first, draw game but don't attach listeners to wait until
    //another player connects.
    //if (!first) {
        //Mouse move event causing a lot of paddle rubberbanding issues for me
        window.addEventListener('mousemove', function(event) {
            movePaddle(event.offsetX, event.offsetY);
        });

        window.addEventListener('touchstart', function (event) {
            var touch = event.changedTouches[event.changedTouches.length - 1];
            movePaddle(touch.pageX, touch.pageY);
        });

        window.addEventListener('touchmove', function (event) {
            var touch = event.changedTouches[event.changedTouches.length - 1];
            movePaddle(touch.pageX, touch.pageY);
        });

        window.addEventListener('keydown', function (event) {
            if (event.keyCode == KEY_LEFT) {
                local_player.paddle.moveLeft();
                socket.emit("move-left", {player: local_player.id});
            } else if (event.keyCode == KEY_RIGHT) {
                local_player.paddle.moveRight();
                socket.emit("move-right", {player: local_player.id});
            } else if (event.keyCode == KEY_SPACE) {
                local_player.paddle.releaseBall();
                event.preventDefault();
            } else {
                console.log(event.keyCode);
            }
        });

        window.addEventListener('keyup', function (event) {
            if (event.keyCode == KEY_LEFT || event.keyCode == KEY_RIGHT) {
                local_player.paddle.stop();
            }
        });
    //} else {
        //overlay something over the canvas to indicate that client is waiting for opponent
    //}
    //bricks.push(new Brick(10,10))
    drawCanvas();
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
        img.src = "images/return_from_full_screen.png";
        img.alt = "Return from full screen";
    } else {
        cancelFullScreen.call(doc);
        img.src = "images/full_screen.png";
        img.alt = "Go full screen";
    }
}

function setup() {
    socket = io.connect();
    initGame('body', 'game-canvas');
    socket.on('first', function (msg) {
        console.log(msg.message);
        console.log(msg.first);
        console.log(msg);
        local_player.id = msg.playerId;
        first = msg.first;
    });

    socket.on('move-left', function(data) {
        console.log("Player moved left", data);
    });

    socket.on('move-right', function(data) {
        console.log("Player moved right", data);
    });

}
