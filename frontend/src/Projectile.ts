import 'p5'
import Sprite from './Sprite'
import { TILE_SIZE, DEBUG } from './utils'

const LIFE_TIME = 2500
const MAX_VEL = 2
export default class Projectile extends Sprite{
    alive: boolean
    creationTime: number
    constructor(look: p5.Image, x:number, y:number, rot:number) {
        super(look, x, y, 10,10)
        this.data.rot = rot
        this.data.velX = MAX_VEL * Math.cos(rot)
        this.data.velY = MAX_VEL * Math.sin(rot)
        this.alive = true
        this.creationTime = Date.now()
    }

    update(timeDelta: number, s:any) {
        if(Date.now() - this.creationTime > LIFE_TIME) {
            this.alive = false
            return
        }
        const mult = timeDelta/100
        this.data.x += this.data.velX * mult
        this.data.y += this.data.velY * mult
    }

    draw(s:any) {
        s.push()
        s.translate(this.data.x * TILE_SIZE, this.data.y * TILE_SIZE)
        s.fill('black')
        s.noStroke()
        s.ellipse(0,0,10)
        if (DEBUG) {
            s.stroke(255, 0, 0)
            s.noFill()
            s.ellipse(0,0, this.width)
        }
        s.pop()
    }
}