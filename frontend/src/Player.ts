/// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Sprite from './Sprite'
import Anim from './Animation'
import { CANVAS_SIZE, TILE_SIZE, DEBUG } from './utils'
import Background from './Background';

const [width, height] = CANVAS_SIZE

let PLAYER_SPEED = 10

export default class Player extends Sprite {
    spectator:boolean
    latency: number
    points:number
    constructor(id:string='player', look: Anim | p5.Image, x: number, y: number, width?: number, height?: number) {
        super(id, look, x, y)
        this.data.health = {
            max: 100,
            cur: 100,
        }
        this.spectator = false
    }
    update(timeDelta: number, s:any, background:Background) {
        const level = background.getLevel(s, this.data.x, this.data.y)
        if(!this.spectator) {
            if(level == 0) { PLAYER_SPEED = 3 }
            else if(level == 1) { PLAYER_SPEED = 7}
            else { PLAYER_SPEED = 10 }
        }
        this.data.rot = Math.atan2(s.mouseY - (height / 2), s.mouseX - (width / 2))

        this.data.velX = 0
        this.data.velY = 0
        if(s.keyIsDown(s.LEFT_ARROW) || s.keyIsDown(65)){ this.data.velX = -PLAYER_SPEED }
        if(s.keyIsDown(s.RIGHT_ARROW) || s.keyIsDown(68)){ this.data.velX = PLAYER_SPEED }
        if(s.keyIsDown(s.UP_ARROW) || s.keyIsDown(87)){ this.data.velY = -PLAYER_SPEED }
        if(s.keyIsDown(s.DOWN_ARROW) || s.keyIsDown(83)){ this.data.velY = PLAYER_SPEED }
        const mult = timeDelta/1000
        this.data.x += this.data.velX * mult
        this.data.y += this.data.velY * mult
    }
}