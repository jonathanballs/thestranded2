/// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Anim from './Animation'
import { TILE_SIZE, DEBUG, debug } from './utils'
import Background from './Background';

export interface SharedData {
        id: string
        x: number
        y: number
        rot: number
        velX: number
        velY: number
        timestampUpdated: number
        health: {
            max: number
            cur: number
        }
}

export default class Sprite {
    name: string
    data: SharedData
    width: number
    height: number
    look: Anim | p5.Image
    constructor(id:string='player', look: Anim | p5.Image, x: number, y: number, width?: number, height?: number) {
        this.data = {
            id,
            x, y, 
            rot: 0,
            velX: 0,
            velY: 0,
            timestampUpdated: Date.now(),
            health: {
                max:1,
                cur:1
            }
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

    update(timeDelta: number, s:any, background?:Background) {
        const mult = timeDelta/1000
        this.data.x += this.data.velX * mult
        this.data.y += this.data.velY * mult
    }

    draw(s:any, time:number=Date.now(), noDebug:boolean = DEBUG) {
        s.push()
        s.translate(this.data.x * TILE_SIZE, this.data.y * TILE_SIZE)
        s.noStroke()
        s.fill('green')
        s.rect(0,-50, s.map(
            this.data.health.cur,
            0,
            this.data.health.max,
            0,60
        ), 10)

        if (this.name) {
            s.fill('black')
            s.textAlign(s.CENTER)
            s.textSize(15);
            s.rotate(0);
            s.text(this.name, 0, -30);
        }

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

        s.pop();
    }

    isColliding(s:any, target:Sprite): boolean {
        const distance2 = Math.pow(this.data.y - target.data.y,2) + Math.pow(this.data.x - target.data.x,2)
        const collisionDistance = Math.pow(this.width/TILE_SIZE,2) + Math.pow(target.width/TILE_SIZE, 2)
        if(DEBUG){
            s.stroke(collisionDistance/distance2 * 255)
            s.line(
                this.data.x * TILE_SIZE,
                this.data.y * TILE_SIZE,
                target.data.x * TILE_SIZE,
                target.data.y * TILE_SIZE,
                )
        }
        if(distance2 < collisionDistance) {
            debug(this.data, 'collided with', target)
            return true
        }
        return false
    }
}