/// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Anim from './Animation'
import { TILE_SIZE, DEBUG, debug } from './utils'


export default class Sprite {
    x: number
    y: number
    rot: number
    velX: number
    velY: number
    width: number
    height: number
    look: Anim | p5.Image
    constructor(look: Anim | p5.Image, x: number, y: number, width?: number, height?: number) {
        this.x = x
        this.y = x
        this.rot = 1
        this.velX = 0
        this.velY = 0
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
        this.x += this.velX * mult
        this.y += this.velY * mult
    }

    draw(s:any) {
        s.push()
        s.translate(this.x * TILE_SIZE, this.y * TILE_SIZE)
        s.rotate(this.rot)
        if (this.look instanceof Anim) {
            s.image(this.look.imageList[0], 0, 0, this.width, this.height)
        } else {
            s.image(this.look, 0,0, this.width, this.height)
        }
        if (DEBUG) {
            s.stroke(255, 0, 0)
            s.noFill()
            s.ellipse( 0,0, this.width)
        }
        s.pop()
    }
}