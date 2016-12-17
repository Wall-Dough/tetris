var game;

function Tetris(w, h, b_d) {
    this.w = w;
    this.h = h;
    this.b_d = b_d;

    this._init = function () {
        this.c = document.createElement("canvas");

        this.c.width = this.w * this.b_d;
        this.c.height = this.h * this.b_d;

        var sizeString = this.b_d.toString() + "px";
        sizeString += " " + sizeString;
        this.c.setAttribute("style", "background-size: " + sizeString);

        document.body.appendChild(this.c);

        this.ctx = this.c.getContext("2d");

        this.map = [];
        for (var i = 0; i < this.h; i++) {
            var row = [];
            for (var j = 0; j < this.w; j++) {
                row.push(false);
            }
            this.map.push(row);
        }
    }

    this.outOfBounds = function(i, j) {
        return (i < 0) || (j < 0) || (i >= this.h) || (j >= this.w);
    };

    this.draw = function(i, j) {
        if (this.outOfBounds(i, j)) return;

        if (!this.get(i, j)) return;

        this.ctx.beginPath();
        this.ctx.fillStyle = "black";
        this.ctx.rect(j * this.b_d, i * this.b_d, this.b_d, this.b_d);
        this.ctx.fill();
    };

    this.drawAll = function() {
        for (var i = 0; i < this.h; i++) {
            for (var j = 0; j < this.w; j++) {
                this.draw(i, j);
            }
        }
    };

    this.set = function(i, j, val) {
        if (this.outOfBounds(i, j)) return;

        this.map[i][j] = val;
    };

    this.get = function(i, j) {
        if (this.outOfBounds(i, j)) return false;

        return this.map[i][j];
    };
}

window.onload = function () {
    game = new Tetris(12, 24, 25);
    game._init();
};
