// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Sprite from './Sprite'
import Anim from './Animation'

var playerAnim:Anim;
var player:Sprite;

const sketch = (s:any) => {
    s.preload = () => {
        playerAnim = new Anim(s, '/static/imgs/blue.png', '/static/imgs/blue_walk.png')
    }
    s.setup = () => {
        s.createCanvas(800, 600)
        s.imageMode(s.CENTER)
        s.rectMode(s.CENTER)
        player = new Sprite(playerAnim, 200, 200)
        player.x = 5
        player.y = 5
    }
    s.draw = () => {
        s.background(255)
        player.draw(s)
    }
}

//@ts-ignore
const P5 = new p5(sketch)
