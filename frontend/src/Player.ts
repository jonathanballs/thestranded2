/// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Sprite from './Sprite'
import Anim from './Animation'
import { CANVAS_SIZE, TILE_SIZE, DEBUG } from './utils'

const [width, height] = CANVAS_SIZE

const PLAYER_SPEED = 10

export default class Player extends Sprite {
    update(timeDelta: number, s:any) {
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