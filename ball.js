function Ball(id, x, y, speed, r, c) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = speed,
    this.radius = r;
    this.color = c;
    this.attachedPaddle = null;
    this.netX = null; // networked x and y
    this.netY = null;
    this.netVx = null;
    this.netVy = null;
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
Ball.prototype.update = function(deltatime) {
    if (this.attachedPaddle) {
        // stay near paddle
        var y = this.attachedPaddle.y - this.radius;
        if (!this.attachedPaddle.attachedTop) {
            y = this.attachedPaddle.y + this.attachedPaddle.height + this.radius;
        }
        this.x = this.attachedPaddle.x + this.attachedPaddle.width / 2;
        this.y = y;
    } else {
        if (this.netX) this.x = this.netX;
        if (this.netY) this.y = this.netY;
        if (this.netVx) this.vx = this.netVx;
        if (this.netVy) this.vy = this.netVy;
        this.x += this.vx * deltatime;
        this.y += this.vy * deltatime;

        this.netX = null;
        this.netY = null;
        this.netVx = null;
        this.netVy = null;
    }
}
