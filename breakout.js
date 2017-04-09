var BRICK_WIDTH = 50;
var BRICK_HEIGHT = 20;
var PADDLE_WIDTH = 100;
var PADDLE_HEIGHT = 15;
var PADDLE_SPEED = 3;
var EDGE_COLOR = "black";
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;

var canvas = null;
var c = null;
var players = [];
var local_player = null;
var next_player_id = 0;

function Player(id, name) {
    this.id = id;
    this.name = name;
    this.paddle = null;
    this.bricks = null;
    this.balls = null;
}

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
            collideBallAndPlayerBricks(ball, bricks);
            collideBallAndPlayerPaddle(ball, paddle);
            hit_bottom = collideBallAndScreen(ball, player == local_player);
            if (hit_bottom) {
                // TODO: remove ball and allow adding another from paddle
                console.log("Hit bottom!");
            }
            ball.update();
            ball.draw(c);
        });

        // draw bricks
        for (var j = 0; j < bricks.length; ++j) {
            bricks[j].draw(c);
        }

        // draw paddles
        paddle.update();
        paddle.draw(c);
    }

    raf = window.requestAnimationFrame(drawCanvas);
}

function resizeCanvas() {
    var borderSize = 2;
    canvas.width = window.innerWidth - borderSize;
    canvas.height = window.innerHeight - borderSize;
}

function createPlayer() {
    var player = new Player(next_player_id++, "Steven");
    player.paddle = new Paddle(
        canvas.width / 2 - PADDLE_WIDTH / 2,
        canvas.height - PADDLE_HEIGHT - 10,
        0, 0);

    player.balls = [];
    player.bricks = [];

    return player;
}

function movePaddle(x, y) {
    local_player.paddle.targetX = x - PADDLE_WIDTH / 2;
}

function initGame(bodyId, canvasId) {
    console.log('added event listener');

    canvas = document.getElementById(canvasId);
    c = canvas.getContext('2d');
    resizeCanvas();

    window.addEventListener('resize', function (event) {
        //console.log("on resize");
        resizeCanvas();
    });

    var ball = new Ball(120, 120, 5, -5, 6, 'green');

    var player = createPlayer();
    local_player = player;
    player.balls.push(ball);
    players.push(player);

    window.addEventListener('mousemove', function(event) {
        movePaddle(event.offsetX, event.offsetY);
    });

    window.addEventListener('touchstart', function(event) {
        var touch = event.changedTouches[event.changedTouches.length - 1];
        movePaddle(touch.pageX, touch.pageY);
    });

    window.addEventListener('touchmove', function(event) {
        var touch = event.changedTouches[event.changedTouches.length - 1];
        movePaddle(touch.pageX, touch.pageY);
    });

    window.addEventListener('keydown', function(event) {
        if (event.keyCode == KEY_LEFT) {
            local_player.paddle.moveLeft();
        } else if (event.keyCode == KEY_RIGHT) {
            local_player.paddle.moveRight();
        }
    });

    window.addEventListener('keyup', function(event) {
        if (event.keyCode == KEY_LEFT || event.keyCode == KEY_RIGHT) {
            local_player.paddle.stop();
        }
    });

    // add bricks
    var num_bricks = Math.floor(canvas.width / BRICK_WIDTH);
    var x_offset = (canvas.width - num_bricks * BRICK_WIDTH) / 2;
    var y = 10;
    console.log("Made " + num_bricks + " bricks");
    for (var j = 0; j < 5; ++j) {
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
    //bricks.push(new Brick(10,10))
    drawCanvas();
}

// from https://developers.google.com/web/fundamentals/native-hardware/fullscreen/
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
