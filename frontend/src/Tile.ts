import 'p5'
import Sprite from './Sprite';
import { TILE_SIZE } from './utils'

export default class Tile extends Sprite {
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