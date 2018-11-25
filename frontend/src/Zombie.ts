import 'p5'
import Sprite from './Sprite'
import { deflateRaw } from 'zlib';
import Anim from './Animation'
import { TILE_SIZE, DEBUG } from './utils'
import { start } from 'repl';

export default class Zombie extends Sprite {
    draw(s:any, time:number=Date.now(), noDebug:boolean = DEBUG) {
        const startTime = Date.now()
        const timeDelta = (time -this.data.timestampUpdated) / 1000
        this.data.x = (this.data.x + (timeDelta * this.data.velX))
        this.data.y = (this.data.y + (timeDelta * this.data.velY))
        s.push()
        s.translate(this.data.x * TILE_SIZE ,this.data.y * TILE_SIZE)
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
        this.data.timestampUpdated = time + (Date.now() - startTime)
    }
}