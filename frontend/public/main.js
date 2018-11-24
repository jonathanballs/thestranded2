"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("app", ["require", "exports", "socket.io-client"], function (require, exports, socket_io_client_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    socket_io_client_1 = __importDefault(socket_io_client_1);
    var socket = socket_io_client_1.default();
    socket.on('connect', function () {
        console.log("Connected");
    });
});
/// <reference path="../types//p5.global-mode.d.ts" />
var DEBUG = true;
var debug = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
};
if (DEBUG) {
    debug = console.log;
}
var playerAnim;
var player;
// @ts-ignore
function preload() {
    playerAnim = new Anim('/static/imgs/blue.png', '/static/imgs/blue_walk.png');
}
function setup() {
    createCanvas(800, 600);
    // @ts-ignore
    imageMode(CENTER);
    // @ts-ignore
    rectMode(CENTER);
    player = new Sprite(playerAnim, 200, 200);
}
function draw() {
    background(255);
    player.x = mouseX;
    player.y = mouseY;
    player.draw();
}
var Sprite = /** @class */ (function () {
    function Sprite(look, x, y, width, height) {
        var _a, _b;
        this.x = x;
        this.y = x;
        if (width != null && height != null) {
            this.width = width;
            this.height = height;
        }
        else if (look instanceof Anim) {
            _a = [look.imageList[0].width, look.imageList[0].height], this.width = _a[0], this.height = _a[1];
        }
        else {
            _b = [look.width, look.height], this.width = _b[0], this.height = _b[1];
        }
        this.look = look;
    }
    Sprite.prototype.draw = function () {
        if (this.look instanceof Anim) {
            image(this.look.imageList[0], this.x, this.y, this.width, this.height);
        }
        else {
            image(this.look, this.x, this.y, this.width, this.height);
        }
        if (DEBUG) {
            stroke(255, 0, 0);
            noFill();
            rect(this.x, this.y, this.width, this.height);
        }
    };
    return Sprite;
}());
var Anim = /** @class */ (function () {
    function Anim() {
        var imgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            imgs[_i] = arguments[_i];
        }
        this.imageList = imgs.map(function (location) {
            debug("Loading image: " + location);
            return loadImage(location);
        });
    }
    return Anim;
}());
