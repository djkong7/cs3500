function Paddle(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.targetX = 0; // where it moves to, then stops
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.color = "blue";
}

Paddle.prototype.draw = function(c) {
    c.beginPath();
    // draw black edge for bottom right
    c.fillStyle = EDGE_COLOR;
    c.fillRect(this.x, this.y, this.width, this.height);
    // draw actual paddle
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, this.width-1, this.height-1);
    c.stroke();
}

Paddle.prototype.update = function() {

    if (this.targetX != 0) {
        if (this.x > this.targetX) {
            this.vx = -PADDLE_SPEED;
        } else {
            this.vx = PADDLE_SPEED;
        }

        if (Math.abs(this.targetX - this.x) <= 1) {
            this.targetX = 0;
            this.vx = 0;
        }
    }
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 ) this.x = 0;
    if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
}

Paddle.prototype.moveLeft = function() {
    this.vx = -PADDLE_SPEED;
    this.targetX = 0;
}

Paddle.prototype.moveRight = function() {
    this.vx = PADDLE_SPEED;
    this.targetX = 0;
}

Paddle.prototype.stop = function() {
    this.vx = 0;
    this.vy = 0;
    this.targetX = 0;
}
