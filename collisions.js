function collideBallAndScreen(ball, is_local) {
    var hit_bottom = false;
    //Edge of scrren
    if (ball.y > canvas.height - ball.radius || ball.y < ball.radius) {
        ball.vy = -ball.vy;
    }
    if (ball.x > canvas.width - ball.radius || ball.x < ball.radius) {
        ball.vx = -ball.vx;
    }

    // if this is a local player ball, return true if hit bottom of screen
    if (is_local) {
        if (ball.y > canvas.height - ball.radius) {
            hit_bottom = true;
        }
    }

    return hit_bottom;
}

//Handles ball collision
function collideBallAndPlayerBricks(ball, bricks) {
    //Bricks
    var yreverse = false;
    var xreverse = false;
    bricks.forEach(function (brick) {
        //console.log(that);
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
    }
}
