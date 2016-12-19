var game;
var block;

function Point(i, j) {
    this.i = i;
    this.j = j;
}

function p(i, j) {
    return {"i": i, "j": j};
}

var blockTypes = {
    i: function() {
        return {
            a: [p(1,0), p(1,1), p(1,2), p(1,3)],
            w: 4
        }
    },
    j: function() {
        return {
            a: [p(1,0), p(1,1), p(1,2), p(2,2)],
            w: 3
        }
    },
    l: function() {
        return {
            a: [p(1,0), p(2,0), p(1,1), p(1,2)],
            w: 3
        }
    },
    o: function() {
        return {
            a: [p(0,0), p(1,0), p(0,1), p(1,1)],
            w: 2
        }
    },
    s: function() {
        return {
            a: [p(1,0), p(0,1), p(1,1), p(0,2)],
            w: 3
        }
    },
    t: function() {
        return {
            a: [p(1,0), p(1,1), p(2,1), p(1,2)],
            w: 3
        }
    },
    z: function() {
        return {
            a: [p(0,0), p(0,1), p(1,1), p(1,2)],
            w: 3
        }
    }
};

var typesArray = Object.keys(blockTypes);

function Block(i, j, type, t) {
    this.i = i;
    this.j = j;
    this.t = t;
    this.type = type;
    this.map = blockTypes[type]();
    this.i -= Math.floor(this.map.w / 2);
    this.j -= Math.floor(this.map.w / 2);

    this.leftMost = null;
    this.rightMost = null;
    this.bottomMost = null;

    this.checkCollision = function () {
        for (var i in this.map.a) {
            var p = this.map.a[i];
            if (this.t.get(this.i + p.i, this.j + p.j)) {
                return true;
            }
        }
        return false;
    };

    this.getLeftMost = function () {
        if (this.leftMost == null) {
            this.leftMost = this.map.a[0].j;
            for (var i = 1; i < this.map.a.length; i++) {
                var p = this.map.a[i];
                if (p.j < this.leftMost) {
                    this.leftMost = p.j;
                }
            }
        }
        return this.j + this.leftMost;
    };

    this.getRightMost = function () {
        if (this.rightMost == null) {
            this.rightMost = this.map.a[0].j;
            for (var i = 1; i < this.map.a.length; i++) {
                var p = this.map.a[i];
                if (p.j > this.rightMost) {
                    this.rightMost = p.j;
                }
            }
        }
        return this.j + this.rightMost;
    };

    this.getBottomMost = function () {
        if (this.bottomMost == null) {
            this.bottomMost = this.map.a[0].i;
            for (var i = 1; i < this.map.a.length; i++) {
                var p = this.map.a[i];
                if (p.i > this.bottomMost) {
                    this.bottomMost = p.i;
                }
            }
        }
        return this.i + this.bottomMost;
    };

    this.rotateLeft = function () {
        this.undraw();
        for (var i in this.map.a) {
            var p = this.map.a[i];
            var tmp = this.map.w - p.j - 1;
            p.j = p.i;
            p.i = tmp;
        }
        this.leftMost = null;
        this.rightMost = null;
        this.bottomMost = null;
        this.draw();
    };

    this.rotateRight = function () {
        this.undraw();
        for (var i in this.map.a) {
            var p = this.map.a[i];
            var tmp = this.map.w - p.i - 1;
            p.i = p.j;
            p.j = tmp;
        }
        this.leftMost = null;
        this.rightMost = null;
        var moved = 0;
        while (this.getLeftMost() < 0) {
            this.j++;
            moved++;
        }
        while (this.getRightMost() >= this.t.w) {
            this.j--;
            moved--;
        }
        this.draw();
    };

    this.draw = function() {
        for (var i in this.map.a) {
            var p = this.map.a[i];
            this.t.ctx.beginPath();
            this.t.ctx.fillStyle = "black";
            this.t.ctx.fillRect((this.j + p.j) * this.t.b_d,
                                (this.i + p.i) * this.t.b_d,
                                this.t.b_d, this.t.b_d);
            this.t.ctx.closePath();
        }
    };

    this.undraw = function() {
        for (var i in this.map.a) {
            var p = this.map.a[i];
            this.t.draw(this.i + p.i, this.j + p.j);
        }
    };

    this.finish = function() {
        for (var i in this.map.a) {
            var p = this.map.a[i];
            this.t.set(this.i + p.i, this.j + p.j);
        }
        this.t.block = null;
    };

    this.moveLeft = function () {
        if (this.getLeftMost() > 0) {
            this.undraw();
            this.j--;
            this.draw();
        }
    };

    this.moveRight = function () {
        if (this.getRightMost() < (this.t.w - 1)) {
            this.undraw();
            this.j++;
            this.draw();
        }
    };

    this.drop = function () {
        if (this.getBottomMost() < (this.t.h - 1)) {
            this.undraw();
            this.i++;
            if (this.checkCollision()) {
                this.i--;
                this.finish();
            }
            this.draw();
        }
        else {
            this.finish();
        }
    };

    this.step = function() {
        this.drop();
    };
}

function Tetris(w, h, b_d) {
    this.w = w;
    this.h = h;
    this.b_d = b_d;
    this.n = 2;

    this.blockQueue = [];
    this.linesDrawn = false;

    this.popBlock = function () {
        this.block = new Block(3, Math.floor(this.w / 2), this.blockQueue.pop(), this);
        this.addBlockToQueue();
    };

    this.addBlockToQueue = function () {
        this.blockQueue.push(typesArray[Math.floor(Math.random() * typesArray.length)]);
    };

    this.addBlocksToQueue = function () {
        for (var i = 0; i < (this.n - this.blockQueue.length); i++) {
            this.addBlockToQueue();
        }
    };

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

        this.toClear = [];

        this.drawAll();

        this.addBlocksToQueue();
        this.popBlock();
        this.block.draw();
    }

    this.outOfBounds = function(i, j) {
        return (i < 0) || (j < 0) || (i >= this.h) || (j >= this.w);
    };

    this.draw = function(i, j) {
        if (this.outOfBounds(i, j)) return;

        this.ctx.beginPath();
        this.ctx.fillStyle = "black";
        if (this.get(i, j)) {
            this.ctx.fillRect(j * this.b_d, i * this.b_d, this.b_d, this.b_d);
        }
        else {
            this.ctx.clearRect(j * this.b_d, i * this.b_d, this.b_d, this.b_d);
        }
        this.ctx.closePath();
    };

    this.drawAll = function() {
        for (var i = 0; i < this.h; i++) {
            var isLine = true;
            for (var j = 0; j < this.w; j++) {
                isLine *= this.get(i, j);
                this.draw(i, j);
            }
            if (isLine) this.toClear.push(i);
        }
    };

    this.hasLines = function() {
        return (this.toClear.length > 0);
    }

    this.drawLine = function(i) {
        this.ctx.beginPath();
        this.ctx.fillStyle = "gray";
        this.ctx.rect(0, i * this.b_d, this.w * this.b_d, this.b_d);
        this.ctx.fill();
    };

    this.clearLine = function(i) {
        this.map.splice(i, 1);
        var newRow = [];
        for (var i = 0; i < this.w; i++) newRow.push(false);
        this.map.unshift(newRow);
    };

    this.clearLines = function() {
        while (this.toClear.length > 0) {
            var i = this.toClear.pop();
            this.clearLine(i);
            for (var j in this.toClear) {
                if (i < this.toClear[j]) {
                    this.toClear[j]++;
                }
            }
        }
        this.drawAll();
    };

    this.drawLines = function() {
        for (var i in this.toClear) {
            this.drawLine(this.toClear[i]);
        }
    };

    this.setVal = function(i, j, val) {
        if (this.outOfBounds(i, j)) return;

        this.map[i][j] = val;

        var isLine = true;
        for (var jj in this.map[i]) {
            if (!this.get(i, jj)) {
                isLine = false;
                break;
            }
        }
        if (isLine) this.toClear.push(i);
    }

    this.set = function(i, j) {
        this.setVal(i, j, true);
    };

    this.unset = function(i, j) {
        this.setVal(i, j, false);
    };

    this.get = function(i, j) {
        if (this.outOfBounds(i, j)) return false;

        return this.map[i][j];
    };

    this.step = function () {
        if (!this.linesDrawn && this.hasLines()) {
            this.drawLines();
            this.linesDrawn = true;
        }
        else if (this.hasLines()) {
            this.clearLines();
            this.linesDrawn = false;
        }
        if ((this.block == null) && !this.linesDrawn) {
            this.popBlock();
            this.block.draw();
        }
        if (this.block != null) {
            this.block.step();
        }
    };
}

window.onload = function () {
    var w = 12;
    var h = 24;
    game = new Tetris(w, h, 25);
    game._init();

    window.onkeydown = function (e) {
        var key = e.keyCode;
        console.log(key);
        if (game.block != null) {
            if (key == 90) {
                game.block.rotateLeft();
            }
            else if (key == 88) {
                game.block.rotateRight();
            }
            else if (key == 37) {
                game.block.moveLeft();
            }
            else if (key == 39) {
                game.block.moveRight();
            }
            else if (key == 40) {
                game.block.drop();
            }
        }
    };

    setInterval(function () {
        game.step();
    }, 500);
};
