var canvas = null;

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

    c.arc(100, 100, 50, 1, Math.PI/2, true);
    c.stroke();
}

function resizeCanvas() {
    var borderSize = 2;
    canvas.width = window.innerWidth - borderSize;
    canvas.height = window.innerHeight - borderSize;

    drawCanvas();
}

function initGame(bodyId, canvasId) {
    console.log('added event listener');

    canvas = document.getElementById(canvasId);
    resizeCanvas();

    window.addEventListener('resize', function (event) {
        //console.log("on resize");
        resizeCanvas();
    });

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
