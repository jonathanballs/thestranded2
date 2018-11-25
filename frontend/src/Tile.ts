import 'p5'
import Sprite from './Sprite';
import Anim from './Animation'
import { TILE_SIZE } from './utils'

export default class Tile extends Sprite {
    constructor(look: Anim | p5.Image, x: number, y: number, width?: number, height?: number) {
        super('noId', look, x, y)
    }
    draw(s:any) {
        // s.push()
        // s.translate(this.x * TILE_SIZE, this.y * TILE_SIZE)
        s.image(this.look, 
            this.data.x * TILE_SIZE,
            this.data.y * TILE_SIZE,
            this.width, this.height)
        // s.pop()
    }
}