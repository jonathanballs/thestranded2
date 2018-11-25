import 'p5'
import Sprite from './Sprite'
import { TILE_SIZE, DEBUG } from './utils'

const LIFE_TIME = 2500
const MAX_VEL = 20
export default class Projectile extends Sprite{
    alive: boolean
    constructor(look: p5.Image, x:number, y:number, rot:number) {
        super(look, x, y, 10,10)
        this.data.rot = rot
        this.data.velX = MAX_VEL * Math.cos(rot)
        this.data.velY = MAX_VEL * Math.sin(rot)
        this.data.timestampUpdated = Date.now()
        this.alive = true
    }

    draw(s:any) {
        if(Date.now() - this.data.timestampUpdated > LIFE_TIME) {
            this.alive = false
            return
        }
        const timeDelta = (Date.now() - this.data.timestampUpdated) / 1000
        const x = (this.data.x + (timeDelta* this.data.velX)) * TILE_SIZE
        const y = (this.data.y + (timeDelta* this.data.velY)) * TILE_SIZE
        s.push()
        s.translate(x,y)
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