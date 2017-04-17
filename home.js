var bricks = document.getElementById('bricks');
var paddle = document.getElementById('paddle');
var ball = document.getElementById('ball');

function startGame(){
    setCookies();
    location.href = 'breakout.html';
}

function setCookies() {
    setCookie('bricks', bricks.value, 7);
    setCookie('paddle', paddle.value, 7);
    setCookie('ball', ball.value, 7);
}

function getCookies(){
    var brickCookie = getCookie('bricks');
    var paddleCookie = getCookie('paddle');
    var ballCookie = getCookie('ball');
    if(brickCookie) bricks.value = brickCookie;
    if(paddleCookie) paddle.value = paddleCookie;
    if(ballCookie) ball.value = ballCookie;
}