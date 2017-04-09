function Ball(x, y, vx, vy, r, c) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = r;
    this.color = c;
}

Ball.prototype.draw = function(c) {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    c.fillStyle = this.color;
    c.fill();
};

Ball.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
}
