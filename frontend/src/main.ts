// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Sprite from './Sprite'
import Player from './Player'
import Anim from './Animation'

var playerAnim:Anim;
var player:Sprite;
var lastUpdate = 0

const sketch = (s:any) => {
    s.preload = () => {
        playerAnim = new Anim(s, '/static/imgs/blue.png', '/static/imgs/blue_walk.png')
    }
    s.setup = () => {
        s.createCanvas(800, 600)
        s.imageMode(s.CENTER)
        s.rectMode(s.CENTER)
        player = new Player(playerAnim, 200, 200)
        player.x = 5
        player.y = 5
        lastUpdate = Date.now()
    }
    s.draw = () => {
        const curTime = Date.now()
        s.background(255)
        player.update(curTime - lastUpdate, s)
        player.draw(s)
        lastUpdate = curTime
    }
}

//@ts-ignore
const P5 = new p5(sketch)
