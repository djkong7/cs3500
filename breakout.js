var canvas = null;
var c = null;
var balls = [];

function drawCanvas() {
    var w = canvas.width;
    var h = canvas.height;
    var c = canvas.getContext('2d');

    c.strokeStyle = "gray";
    c.fillStyle = "gray";

    c.fillRect(0, 0, w, h);

    c.strokeStyle = "blue";
    c.fillStyle = "blue";
    c.lineWidth = 2;
    
    balls.forEach(function(ball){
        ball.draw(c);
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.y + ball.vy > canvas.height - ball.radius || ball.y + ball.vy < ball.radius) {
            ball.vy = -ball.vy;
        }
        if (ball.x + ball.vx > canvas.width  - ball.radius || ball.x + ball.vx < ball.radius) {
            ball.vx = -ball.vx;
        }
    });
    
    
    raf = window.requestAnimationFrame(drawCanvas);
}

function resizeCanvas() {
    var borderSize = 2;
    canvas.width = window.innerWidth - borderSize;
    canvas.height = window.innerHeight - borderSize;

    //drawCanvas();
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
    
    var ball= new Ball(100,100,5,1,25,'green');
    balls.push(ball);
    
    drawCanvas();
}

// from https://developers.google.com/web/fundamentals/native-hardware/fullscreen/
function toggleFullscreen() {
  var doc = window.document;
  var docEl = doc.documentElement;
  var img = document.getElementById('img-fullscreen');

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
    img.src = "images/return_from_full_screen.png";
    img.alt = "Return from full screen";
  } else {
    cancelFullScreen.call(doc);
    img.src = "images/full_screen.png";
    img.alt = "Go full screen";
  }
}

function Ball(x,y,vx,vy,r,c) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = r;
    this.color = c;
}

Ball.prototype.draw = function(c){
    c.beginPath();
    c.arc(this.x,this.y,this.radius,0,2*Math.PI);
    c.fillStyle = this.color;
    c.fill();
};


































