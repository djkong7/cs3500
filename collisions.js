/** Have the ball bounce off the screen edges
 *
 * Ball ball     - the ball that is colliding
 * bool is_local - if this is a local player ball
 *
 * Returns true if ball hit player side of screen
 */
function collideBallAndScreen(ball, is_local) {
    var hitPlayerSide = false;
    //Edge of scrren
    if (ball.y > canvas.gameHeight - ball.radius || ball.y < ball.radius) {
        ball.vy = -ball.vy;
    }
    if (ball.x > canvas.gameWidth - ball.radius || ball.x < ball.radius) {
        ball.vx = -ball.vx;
    }

    // if this is a local player ball, return true if hit bottom of screen
    // otherwise return true if hit top of screen
    if (is_local) {
        if (ball.y >= canvas.gameHeight - ball.radius) {
            hitPlayerSide = true;
        }
    } else {
        if (ball.y <= ball.radius) {
            hitPlayerSide = true;
        }
    }

    return hitPlayerSide;
}

/** Have the ball bounce off and destroy bricks
 *
 * Ball ball     - the ball that is colliding
 * Player player - the player to be rewarded for breaking bricks
 * Brick brick   - bricks array for one player
 *
 * Returns array of collided bricks
 */
function collideBallAndPlayerBricks(ball, player, bricks) {
    //Bricks
    var collidedBricks = [];
    var yreverse = false;
    var xreverse = false;
    bricks.forEach(function (brick) {
        if (brick.valid) {
            if (brick.y <= ball.y + ball.radius && //top
                brick.x + brick.width >= ball.x - ball.radius && //right
                brick.y + brick.height >= ball.y - ball.radius && //bottom
                brick.x <= ball.x + ball.radius //left
            ) {
                collidedBricks.push(brick);
                if (brick.y + brick.height < ball.y || brick.y > ball.y) {
                    yreverse = true;
                }
                if (brick.x + brick.width < ball.x || brick.x > ball.x) {
                    xreverse = true;
                }

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

    return collidedBricks;
}

/** Have the ball bounce off a paddle
 *
 * Ball ball     - the ball that is colliding
 * Paddle paddle - the paddle to check for colliding
 */
function collideBallAndPlayerPaddle(ball, paddle) {
    if (paddle.y <= ball.y + ball.radius &&
        paddle.x + paddle.width >= ball.x - ball.radius &&
        paddle.y + paddle.height >= ball.y - ball.radius &&
        paddle.x <= ball.x + ball.radius
    ) {
        if (paddle.y + paddle.height < ball.y || paddle.y > ball.y) {
            ball.vy = -ball.vy;
        }
        if (paddle.x + paddle.width < ball.x || paddle.x > ball.x) {
            ball.vx = -ball.vx;
        }

        // TODO: Assumes paddle is at bottom of screen, check if not
        if (paddle.y > ball.y) {
            // bounce ball at angle proportional to distance from paddle center
            var diff = ball.x - paddle.x - (paddle.width / 2);
            var normalized = 1 - diff / paddle.width;
            var angle = normalized * MAX_BOUNCE_ANGLE + Math.PI / 2;

            ball.vx = ball.speed * Math.sin(angle);
            ball.vy = -Math.abs(ball.speed * Math.cos(angle));
        }
    }
}
