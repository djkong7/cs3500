function Paddle(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.targetX = 0; // where it moves to, then stops
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.color = "blue";
    this.attachedBall = null;
    this.text = 0;
}

/** Draw the paddle
 */
Paddle.prototype.draw = function(c) {
    c.beginPath();
    // draw black edge for bottom right
    c.fillStyle = EDGE_COLOR;
    c.fillRect(this.x, this.y, this.width, this.height);
    // draw actual paddle
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, this.width-1, this.height-1);
    c.stroke();

    // draw text
    c.fillStyle = "white";
    c.font = "bold 14px sans-serif";
    c.textAlign = "center";
    c.fillText(this.text, this.x + this.width / 2, this.y + this.height -2);
}

/** Update the paddles position, and also prevents going off screen
 */
Paddle.prototype.update = function() {

    if (this.targetX != 0) {
        if (this.x > this.targetX) {
            this.vx = -PADDLE_SPEED;
        } else {
            this.vx = PADDLE_SPEED;
        }

        if (Math.abs(this.targetX - this.x) <= PADDLE_SPEED) {
            this.targetX = 0;
            this.vx = 0;
        } else {
            console.log(Math.abs(this.targetX - this.x));
        }
    }
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 ) this.x = 0;
    if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
}

/** Set the paddle to move left at a constant speed
 */
Paddle.prototype.moveLeft = function() {
    this.vx = -PADDLE_SPEED;
    this.targetX = 0;
}

/** Set the paddle to move right at a constant speed
 */
Paddle.prototype.moveRight = function() {
    this.vx = PADDLE_SPEED;
    this.targetX = 0;
}

/** Stop the paddle from moving
 */
Paddle.prototype.stop = function() {
    this.vx = 0;
    this.vy = 0;
    this.targetX = 0;
}

/** Attach a ball to this paddle
 */
Paddle.prototype.attachBall = function(ball) {
    ball.attachedPaddle = this;
    this.attachedBall = ball;
}

/** Release the ball at an angle from the paddle
 */
Paddle.prototype.releaseBall = function() {
    if (this.attachedBall) {
        this.attachedBall.attachedPaddle = null;
        this.attachedBall.y -= 5;
        this.attachedBall.vx = this.attachedBall.speed * Math.cos(1);
        this.attachedBall.vy = -this.attachedBall.speed * Math.sin(1);
        this.attachedBall = null;
    }
}
