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

//Handles ball collision
Ball.prototype.collideBricks = function(bricks) {
    //Edge of scrren
    if (this.y > canvas.height - this.radius || this.y < this.radius) {
        this.vy = -this.vy;
    }
    if (this.x > canvas.width - this.radius || this.x < this.radius) {
        this.vx = -this.vx;
    }

    //Bricks
    var yreverse = false;
    var xreverse = false;
    var that = this;
    bricks.forEach(function (brick) {
        //console.log(that);
        if (brick.y <= that.y + that.radius && //top
            brick.x + brick.width >= that.x - that.radius && //right
            brick.y + brick.height >= that.y - that.radius && //bottom
            brick.x <= that.x + that.radius //left
        ) {
            bricks.splice(bricks.indexOf(brick), 1);
            if (brick.y + brick.height < that.y || brick.y > that.y) {
                yreverse = true;
            }
            if (brick.x + brick.width < that.x || brick.x > that.x) {
                xreverse = true;
            }

        }
    });
    if (xreverse) {
        that.vx = -that.vx;
    }

    if (yreverse) {
        that.vy = -that.vy;
    }
    //console.log(yFlag + ", " + xFlag);
}