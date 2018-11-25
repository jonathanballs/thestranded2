/// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Anim from './Animation'
import { TILE_SIZE, DEBUG, debug } from './utils'


export default class Sprite {
    data: {
        x: number
        y: number
        rot: number
        velX: number
        velY: number
    }
    width: number
    height: number
    look: Anim | p5.Image
    constructor(look: Anim | p5.Image, x: number, y: number, width?: number, height?: number) {
        this.data = {
            x, y, 
            rot: 0,
            velX: 0,
            velY: 0,
        }
        if (width != null && height != null) {
            this.width = width
            this.height = height
        } else if (look instanceof Anim) {
            [this.width, this.height] = [look.imageList[0].width, look.imageList[0].height]
        } else {
            [this.width, this.height] = [look.width, look.height]
        }
        this.look = look
    }

    update(timeDelta: number, s:any) {
        const mult = timeDelta/100
        this.data.x += this.data.velX * mult
        this.data.y += this.data.velY * mult
    }

    draw(s:any, noDebug:boolean = DEBUG) {
        s.push()
        s.translate(this.data.x * TILE_SIZE, this.data.y * TILE_SIZE)
        s.rotate(this.data.rot)
        if (this.look instanceof Anim) {
            s.image(this.look.imageList[0], 0, 0, this.width, this.height)
        } else {
            s.image(this.look, 0,0, this.width, this.height)
        }
        if (noDebug) {
            s.stroke(255, 0, 0)
            s.noFill()
            s.ellipse(0,0, this.width)
        }
        s.pop()
    }
}