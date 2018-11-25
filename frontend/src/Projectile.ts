import 'p5'
import Sprite from './Sprite'
import { TILE_SIZE, DEBUG } from './utils'

const LIFE_TIME = 2500
const MAX_VEL = 20
export default class Projectile extends Sprite{
    alive: boolean
    renderedFor: number
    constructor(look: p5.Image, x:number, y:number, rot:number) {
        super(look, x, y, 10,10)
        this.data.rot = rot
        this.data.velX = MAX_VEL * Math.cos(rot)
        this.data.velY = MAX_VEL * Math.sin(rot)
        this.data.timestampUpdated = Date.now()
        this.alive = true
        this.renderedFor = 0
        
    }

    draw(s:any, time:number=Date.now(), noDebug:boolean = DEBUG) {
        this.renderedFor += time - this.data.timestampUpdated
        const startTime = Date.now()
        if(this.renderedFor > LIFE_TIME) {
            this.alive = false
            return
        }
        const timeDelta = (time - this.data.timestampUpdated) / 1000
        this.data.x = (this.data.x + (timeDelta * this.data.velX))
        this.data.y = (this.data.y + (timeDelta * this.data.velY))
        s.push()
        s.translate(this.data.x * TILE_SIZE ,this.data.y * TILE_SIZE)
        s.fill('black')
        s.noStroke()
        s.ellipse(0,0,10)
        if (DEBUG) {
            s.stroke(255, 0, 0)
            s.noFill()
            s.ellipse(0,0, this.width)
        }
        s.pop()
        this.data.timestampUpdated = time + (Date.now() - startTime)
    }
}