function Brick(x, y) {
    this.x = x;
    this.y = y;
    this.width = BRICK_WIDTH;
    this.height = BRICK_HEIGHT;
    this.color = 'red';
    this.valid = true;
}

/** Draw the brick
 */
Brick.prototype.draw = function (c) {
    if (!this.valid) {
        return;
    }
    c.beginPath();
    // draw black edge for bottom right
    c.fillStyle = EDGE_COLOR;
    c.fillRect(this.x, this.y, this.width, this.height);
    // draw actual brick
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, this.width - 1, this.height - 1);
    c.stroke();
};
