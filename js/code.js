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
    }
}

window.onload = function () {
    game = new Tetris(12, 24, 25);
    game._init();
};
