import 'p5'
import Sprite from './Sprite'
import { deflateRaw } from 'zlib';
import Anim from './Animation'
import { TILE_SIZE, DEBUG } from './utils'
import { start } from 'repl';

export default class Human extends Sprite {
    draw(s:any, time:number=Date.now(), noDebug:boolean = DEBUG) {
        s.push()
        s.translate(this.data.x * TILE_SIZE, this.data.y * TILE_SIZE)

        if (this.name) {
            s.fill('black')
            s.textAlign(s.CENTER)
            s.textSize(15);
            s.rotate(0);
            s.text(this.name, 0, -30);
        }

        s.noStroke()
        s.fill('green')
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