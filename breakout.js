var BRICK_WIDTH = 50;
var BRICK_HEIGHT = 20;

var canvas = null;
var c = null;
var balls = [];
var bricks = [];

function Brick(x, y) {
    this.x = x;
    this.y = y;
    this.width = BRICK_WIDTH;
    this.height = BRICK_HEIGHT;
    this.color = 'red';
}

Brick.prototype.draw = function (c) {
    c.beginPath();
    c.fillStyle = 'black';
    c.fillRect(this.x, this.y, this.width, this.height);
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

Ball.prototype.draw = function (c) {
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

function drawCanvas(now) {
    var w = canvas.width;
    var h = canvas.height;

    c.strokeStyle = "gray";
    c.fillStyle = "gray";

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

    //console.log("bricks:" + bricks.length);
    for (var i = 0; i < bricks.length; ++i) {
        bricks[i].draw(c);
    }

    raf = window.requestAnimationFrame(drawCanvas);
}

function resizeCanvas() {
    var borderSize = 2;
    canvas.width = window.innerWidth - borderSize;
    canvas.height = window.innerHeight - borderSize;
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
