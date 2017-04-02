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
var balls = [];
var bricks = [];
var players = [];
var local_player = null;
var next_player_id = 0;

function Player(id, name) {
    this.id = id;
    this.name = name;
    this.paddle = null;
}

function Brick(x, y) {
    this.x = x;
    this.y = y;
    this.width = BRICK_WIDTH;
    this.height = BRICK_HEIGHT;
    this.color = 'red';
}

Brick.prototype.draw = function (c) {
    c.beginPath();
    // draw black edge for bottom right
    c.fillStyle = EDGE_COLOR;
    c.fillRect(this.x, this.y, this.width, this.height);
    // draw actual brick
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, this.width - 1, this.height - 1);
    c.stroke();
};

function Ball(x, y, vx, vy, r, c) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = r;
    this.color = c;
}

Ball.prototype.draw = function(c) {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    c.fillStyle = this.color;
    c.fill();
};

//Handles ball collision
function collision(ball) {
    //Edge of scrren
    if (ball.y > canvas.height - ball.radius || ball.y < ball.radius) {
        ball.vy = -ball.vy;
    }
    if (ball.x > canvas.width - ball.radius || ball.x < ball.radius) {
        ball.vx = -ball.vx;
    }

    //Bricks
    var yreverse = false;
    var xreverse = false;
    bricks.forEach(function (brick) {

        if (brick.y <= ball.y + ball.radius && //top
            brick.x + brick.width >= ball.x - ball.radius && //right
            brick.y + brick.height >= ball.y - ball.radius && //bottom
            brick.x <= ball.x + ball.radius //left
        ) {
            bricks.splice(bricks.indexOf(brick), 1);
            if (brick.y + brick.height < ball.y || brick.y > ball.y) {
                yreverse = true;
            }
            if (brick.x + brick.width < ball.x || brick.x > ball.x) {
                xreverse = true;
            }

        }
    });
    if (xreverse) {
        ball.vx = -ball.vx;
    }

    if (yreverse) {
        ball.vy = -ball.vy;
    }
    //console.log(yFlag + ", " + xFlag);
}

function Paddle(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.targetX = 0; // where it moves to, then stops
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.color = "blue";
}

Paddle.prototype.draw = function(c) {
    c.beginPath();
    // draw black edge for bottom right
    c.fillStyle = EDGE_COLOR;
    c.fillRect(this.x, this.y, this.width, this.height);
    // draw actual paddle
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, this.width-1, this.height-1);
    c.stroke();
}

Paddle.prototype.update = function() {

    if (this.targetX != 0) {
        if (this.x > this.targetX) {
            this.vx = -PADDLE_SPEED;
        } else {
            this.vx = PADDLE_SPEED;
        }

        if (Math.abs(this.targetX - this.x) <= 1) {
            this.targetX = 0;
            this.vx = 0;
        }
    }
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 ) this.x = 0;
    if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
}

Paddle.prototype.moveLeft = function() {
    this.vx = -PADDLE_SPEED;
    this.targetX = 0;
}

Paddle.prototype.moveRight = function() {
    this.vx = PADDLE_SPEED;
    this.targetX = 0;
}

Paddle.prototype.stop = function() {
    this.vx = 0;
    this.vy = 0;
    this.targetX = 0;
}

function drawCanvas(now) {
    var w = canvas.width;
    var h = canvas.height;

    c.strokeStyle = "gray";
    c.fillStyle = "#EEE";

    c.fillRect(0, 0, w, h); // clears

    c.strokeStyle = "blue";
    c.fillStyle = "blue";
    c.lineWidth = 2;

    //Handles ball physics
    balls.forEach(function (ball) {
        collision(ball);
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.draw(c);
        //Handle collisions
    });

    // draw bricks
    for (var i = 0; i < bricks.length; ++i) {
        bricks[i].draw(c);
    }

    // draw paddles
    for (var i = 0; i < players.length; ++i) {
        players[i].paddle.update();
        players[i].paddle.draw(c);
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

    balls.push(ball);

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
            bricks.push(b);
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
