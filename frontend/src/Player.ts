/// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Sprite from './Sprite'
import Anim from './Animation'

const PLAYER_SPEED = 3

export default class Player extends Sprite {
    //@ts-ignore
    update(timeDelta: number, s:any) {
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