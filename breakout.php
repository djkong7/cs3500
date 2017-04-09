<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Breakout - Danny Kiel, Steven Johnson</title>
    <link rel="stylesheet" href="breakout.css"/>
    <script type="text/javascript" src="brick.js"></script>
    <script type="text/javascript" src="paddle.js"></script>
    <script type="text/javascript" src="ball.js"></script>
    <script type="text/javascript" src="collisions.js"></script>
    <script type="text/javascript" src="breakout.js"></script>
</head>
<body id='body'>
    <button id="btn-fullscreen" onclick="toggleFullscreen();"><img id='img-fullscreen' src="images/full_screen.png" alt="Go full screen"/></button>
    <canvas id="game-canvas">Canvas not supported :(</canvas>
    <script type="text/javascript">
    initGame('body', 'game-canvas');
    </script>
</body>
</html>
