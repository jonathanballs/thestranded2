// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Sprite from './Sprite'
import Player from './Player'
import Anim from './Animation'
import {DEBUG, CANVAS_SIZE, TILE_SIZE} from './utils'

const [width, height] = CANVAS_SIZE
var playerAnim:Anim;
var player:Sprite;
var lastUpdate = 0

const sketch = (s:any) => {
    s.preload = () => {
        playerAnim = new Anim(s, '/static/imgs/blue.png', '/static/imgs/blue_walk.png')
    }
    s.setup = () => {
        s.createCanvas(width, height)
        s.imageMode(s.CENTER)
        s.rectMode(s.CENTER)
        player = new Player(playerAnim, 200, 200)
        player.x = 5
        player.y = 5
        lastUpdate = Date.now()
        // s.translate(width/2, height/2)
    }
    s.draw = () => {
        s.push()
        s.stroke(255, 0, 0)
        s.noFill()
        s.ellipse(0,0, 50)
        const curTime = Date.now()
        s.background(255)
        s.translate(
            width/2 - (player.x * TILE_SIZE),
            height/2 - (player.y * TILE_SIZE)
            // (player.x * TILE_SIZE) + width/2,
            // (player.y * TILE_SIZE) + height/2
        )
        player.update(curTime - lastUpdate, s)
        player.draw(s)
        lastUpdate = curTime
        if(DEBUG) {
            s.fill('black')
            s.stroke('red')
            s.ellipse(0,0, 10)
        }
        s.pop()
    }
}

//@ts-ignore
const P5 = new p5(sketch)
