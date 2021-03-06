var game;
var keys;
var fps = 60;

function Point(i, j) {
    this.i = i;
    this.j = j;
}

function p(i, j) {
    return {"i": i, "j": j};
}

var blockColors = {
    0: "black",
    1: "cyan",
    2: "blue",
    3: "orange",
    4: "yellow",
    5: "lime",
    6: "purple",
    7: "red"
};

var levelSpeeds = {0: 53, 1: 49, 2: 45, 3: 41, 4: 37,
    5: 33, 6: 28, 7: 22, 8: 17, 9: 11,
    10: 10, 11: 9, 12: 8, 13: 7, 14: 6,
    15: 6, 16: 5, 17: 5, 18: 4, 19: 4, 20: 3};

var blockTypes = {
    i: function() {
        return {
            a: [p(1,0), p(1,1), p(1,2), p(1,3)],
            w: 4,
            c: 1
        }
    },
    j: function() {
        return {
            a: [p(1,0), p(1,1), p(1,2), p(2,2)],
            w: 3,
            c: 2
        }
    },
    l: function() {
        return {
            a: [p(1,0), p(2,0), p(1,1), p(1,2)],
            w: 3,
            c: 3
        }
    },
    o: function() {
        return {
            a: [p(0,0), p(1,0), p(0,1), p(1,1)],
            w: 2,
            c: 4
        }
    },
    s: function() {
        return {
            a: [p(1,0), p(0,1), p(1,1), p(0,2)],
            w: 3,
            c: 5
        }
    },
    t: function() {
        return {
            a: [p(1,0), p(1,1), p(2,1), p(1,2)],
            w: 3,
            c: 6
        }
    },
    z: function() {
        return {
            a: [p(0,0), p(0,1), p(1,1), p(1,2)],
            w: 3,
            c: 7
        }
    }
};

var typesArray = Object.keys(blockTypes);

function KeyWatcher() {
    this.pressed = {};
    this.handled = {};

    this.isPressed = function(key) {
        return Boolean(this.pressed[key]);
    };

    this.isHandled = function(key) {
        return Boolean(this.handled[key]);
    };

    this.isReady = function(key) {
        return this.isPressed(key) && !this.isHandled(key);
    };

    this.press = function(key) {
        this.pressed[key] = true;
    };

    this.unpress = function(key) {
        this.pressed[key] = false;
        this.handled[key] = false;
    };

    this.handle = function(key) {
        this.handled[key] = true;
    };
}

function drawCoordCtx(i, j, b_d, c, ctx) {
    ctx.beginPath();
    ctx.fillStyle = blockColors[c];
    ctx.fillRect(j * b_d, i * b_d, b_d, b_d);
    ctx.closePath();
    if (b_d > 4) {
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.strokeRect((j * b_d) + 1, (i * b_d + 1), b_d - 2, b_d - 2);
        ctx.closePath();
    }
}

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

    this.checkRotation = function (oldMap) {
        this.leftMost = null;
        this.rightMost = null;
        this.bottomMost = null;
        var moved = 0;
        while (this.getLeftMost() < 0) {
            this.j++;
            moved++;
        }
        while (this.getRightMost() >= this.t.w) {
            this.j--;
            moved--;
        }
        if (this.checkCollision()) {
            this.j += moved;
            this.map.a = oldMap;
            this.leftMost = null;
            this.rightMost = null;
            this.bottomMost = null;
        }
        else {
            this.t.ticksLeft = this.t.ticksPerFall;
        }
    }

    this.rotateLeft = function () {
        this.undraw();
        var oldMap = [];
        for (var i in this.map.a) {
            var the_p = this.map.a[i];
            oldMap.push(p(the_p.i, the_p.j));
            var tmp = this.map.w - the_p.j - 1;
            the_p.j = the_p.i;
            the_p.i = tmp;
        }
        this.checkRotation(oldMap);
        this.draw();
    };

    this.rotateRight = function () {
        this.undraw();
        var oldMap = [];
        for (var i in this.map.a) {
            var the_p = this.map.a[i];
            oldMap.push(p(the_p.i, the_p.j));
            var tmp = this.map.w - the_p.i - 1;
            the_p.i = the_p.j;
            the_p.j = tmp;
        }
        this.checkRotation(oldMap);
        this.draw();
    };

    this.draw = function() {
        for (var i in this.map.a) {
            var p = this.map.a[i];
            this.t.drawCoord(this.i + p.i, this.j + p.j, this.map.c);
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
            this.t.setVal(this.i + p.i, this.j + p.j, this.map.c);
        }
        this.t.block = null;
    };

    this.moveLeft = function () {
        if (this.getLeftMost() > 0) {
            this.undraw();
            this.j--;
            if (this.checkCollision()) {
                this.j++;
            }
            this.draw();
        }
    };

    this.moveRight = function () {
        if (this.getRightMost() < (this.t.w - 1)) {
            this.undraw();
            this.j++;
            if (this.checkCollision()) {
                this.j--;
            }
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
    this.lost = false;

    this.stepInterval = -1;

    this.level = 0;
    this.maxLevel = 20;
    this.linesTilNext = 10;
    this.totalLines = 0;

    this.ticksPerFall = levelSpeeds[this.level];
    this.ticksLeft = this.ticksPerFall;
    this.dasDelay = this.ticksPerFall / 3;

    this.popBlock = function () {
        this.block = new Block(3, Math.floor(this.w / 2), this.blockQueue.pop(), this);
        this.addBlockToQueue();
        this.drawNext();
    };

    this.addBlockToQueue = function () {
        this.blockQueue.push(typesArray[Math.floor(Math.random() * typesArray.length)]);
    };

    this.addBlocksToQueue = function () {
        for (var i = 0; i < (this.n - this.blockQueue.length); i++) {
            this.addBlockToQueue();
        }
    };

    this.getNewRow = function () {
        var row = [];
        for (var j = 0; j < this.w; j++) {
            row.push(-1);
        }
        return row;
    };

    this.drawNext = function () {
        this.nextCtx.beginPath();
        this.nextCtx.clearRect(0, 0, this.nextC.width, this.nextC.height);
        this.nextCtx.closePath();
        var map = blockTypes[this.blockQueue[0]]();

        for (var i in map.a) {
            var p = map.a[i];
            drawCoordCtx(p.i, p.j, this.b_d, map.c, this.nextCtx);
        }
    };

    this._init = function () {
        var container = document.createElement("div");
        this.c = document.createElement("canvas");
        this.c.setAttribute("id", "game");

        this.c.width = this.w * this.b_d;
        this.c.height = this.h * this.b_d;

        var sizeString = this.b_d.toString() + "px";
        sizeString += " " + sizeString;
        this.c.setAttribute("style", "background-size: " + sizeString);

        container.appendChild(this.c);

        var rightPane = document.createElement("div");
        rightPane.setAttribute("id", "right-pane");
        var nextText = document.createElement("p");
        nextText.innerHTML = "Next:";
        rightPane.appendChild(nextText);
        this.nextC = document.createElement("canvas");
        this.nextC.width = 4 * this.b_d;
        this.nextC.height = 4 * this.b_d;
        this.nextC.setAttribute("style", "background-size: " + sizeString);
        this.nextCtx = this.nextC.getContext("2d");
        rightPane.appendChild(this.nextC);
        var scoreText = document.createElement("p");
        scoreText.innerHTML = "Score:";
        rightPane.appendChild(scoreText);
        this.scoreElement = document.createElement("p");
        this.updateScore();
        rightPane.appendChild(this.scoreElement);

        container.appendChild(rightPane);

        document.body.appendChild(container);

        this.ctx = this.c.getContext("2d");

        this.map = [];
        for (var i = 0; i < this.h; i++) {
            this.map.push(this.getNewRow());
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

    this.drawCoord = function (i, j, c) {
        drawCoordCtx(i, j, this.b_d, c, this.ctx);
    };

    this.clearCoord = function (i, j) {
        this.ctx.beginPath();
        this.ctx.clearRect(j * this.b_d, i * this.b_d, this.b_d, this.b_d);
        this.ctx.closePath();
    };

    this.draw = function(i, j) {
        if (this.outOfBounds(i, j)) return;

        if (this.get(i, j)) {
            this.drawCoord(i, j, this.map[i][j]);
        }
        else {
            this.clearCoord(i, j);
        }
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
        this.map.unshift(this.getNewRow());
        this.totalLines++;
        this.linesTilNext--;
        if (this.linesTilNext <= 0) {
            if (this.level < this.maxLevel) {
                this.level++;
                this.ticksPerFall = levelSpeeds[this.level];
            }
            this.linesTilNext += 10;
        }
    };

    this.clearLines = function() {
        while (this.toClear.length > 0) {
            var i = this.toClear.pop();
            this.clearLine(i);
            for (var j in this.toClear) {
                if (this.toClear[j] < i) {
                    this.toClear[j]++;
                }
            }
        }
        this.drawAll();
        this.updateScore();
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
        this.setVal(i, j, 0);
    };

    this.unset = function(i, j) {
        this.setVal(i, j, -1);
    };

    this.get = function(i, j) {
        if (this.outOfBounds(i, j)) return false;

        return this.map[i][j] > -1;
    };

    this.updateScore = function () {
        this.scoreElement.innerHTML = this.totalLines.toString();
    };

    this.lose = function () {
        this.lost = true;
    };

    this.start = function () {
        if (this.stepInterval > -1) return;
        this.stepInterval = setInterval(function () {
            game.step();
        }, 1000 / fps);
    };

    this.pause = function () {

    };

    this.step = function () {
        if (this.block != null) {
            if (keys.isReady(90)) {
                this.block.rotateLeft();
                keys.handle(90);
            }
            else if (keys.isReady(88)) {
                this.block.rotateRight();
                keys.handle(88);
            }

            if (keys.isPressed(37)) {
                if (keys.isReady(37)) {
                    this.block.moveLeft();
                    keys.handle(37);
                    this.dasDelay = this.ticksPerFall / 3;
                }
                this.dasDelay--;
                if (this.dasDelay <= 0) {
                    this.block.moveLeft();
                    this.dasDelay = this.ticksPerFall / 6;
                }
            }
            else if (keys.isPressed(39)) {
                if (keys.isReady(39)) {
                    this.block.moveRight();
                    keys.handle(39);
                    this.dasDelay = this.ticksPerFall / 3;
                }
                this.dasDelay--;
                if (this.dasDelay <= 0) {
                    this.block.moveRight();
                    this.dasDelay = this.ticksPerFall / 6;
                }
            }

            if (keys.isPressed(40)) {
                if (keys.isReady(40)) {
                    this.block.drop();
                    this.ticksLeft = this.ticksPerFall;
                    keys.handle(40);
                }
                if (this.ticksLeft > (this.ticksPerFall / 3)) {
                    this.ticksLeft = Math.floor(this.ticksPerFall / 3);
                }
            }
        }

        this.ticksLeft--;
        if (this.ticksLeft <= 0) {
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
            this.ticksLeft = this.ticksPerFall;
        }
    };
}

window.onload = function () {
    var w = 12;
    var h = 24;
    game = new Tetris(w, h, 25);
    game._init();
    keys = new KeyWatcher();

    window.onkeyup = function (e) {
        var key = e.keyCode;
        keys.unpress(key);
    };

    window.onkeydown = function (e) {
        var key = e.keyCode;
        keys.press(key);
    };
    game.start();
};
