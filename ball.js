function Ball(x, y, speed, r, c) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = speed,
    this.radius = r;
    this.color = c;
    this.attachedPaddle = null;
}

/** Draw the ball
 */
Ball.prototype.draw = function(c) {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    c.fillStyle = this.color;
    c.fill();
};

/** Update the ball's position
 */
Ball.prototype.update = function() {
    if (this.attachedPaddle) {
        // stay near paddle
        this.x = this.attachedPaddle.x + this.attachedPaddle.width / 2;
        this.y = this.attachedPaddle.y - this.radius;
    } else {
        this.x += this.vx;
        this.y += this.vy;
    }
}
