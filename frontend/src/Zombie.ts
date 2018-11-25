import 'p5'
import Sprite from './Sprite'
import { deflateRaw } from 'zlib';
import Anim from './Animation'
import { TILE_SIZE, DEBUG } from './utils'

export default class Zombie extends Sprite {
    draw(s:any, noDebug:boolean = DEBUG) {
        const timeDelta = (Date.now() -this.data.timestampUpdated) / 1000
        s.push()
        s.translate(
            (this.data.x + (timeDelta * this.data.velX)) * TILE_SIZE, 
            (this.data.y + (timeDelta * this.data.velY)) * TILE_SIZE
        )
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