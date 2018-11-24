/// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Sprite from './Sprite'
import Anim from './Animation'
import { CANVAS_SIZE, TILE_SIZE, DEBUG } from './utils'

const [width, height] = CANVAS_SIZE

const PLAYER_SPEED = 1

export default class Player extends Sprite {
    update(timeDelta: number, s:any) {
        this.rot = Math.atan2(s.mouseY - (height / 2), s.mouseX - (width / 2))

        this.velX = 0
        this.velY = 0
        if(s.keyIsDown(s.LEFT_ARROW) || s.keyIsDown(65)){ this.velX = -PLAYER_SPEED }
        if(s.keyIsDown(s.RIGHT_ARROW) || s.keyIsDown(68)){ this.velX = PLAYER_SPEED }
        if(s.keyIsDown(s.UP_ARROW) || s.keyIsDown(87)){ this.velY = -PLAYER_SPEED }
        if(s.keyIsDown(s.DOWN_ARROW) || s.keyIsDown(83)){ this.velY = PLAYER_SPEED }
        const mult = timeDelta/100
        this.x += this.velX * mult
        this.y += this.velY * mult
    }
}