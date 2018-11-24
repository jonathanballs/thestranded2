import 'p5'
import Sprite from './Sprite'
import Anim from './Animation'
import { TILE_SIZE } from './utils'

const MAP_SIZE = 40
const NOISE_MULTIPLIER = 0.1

export default class Background {
    tile_set: Anim[]
    map: Sprite[][] = []
    constructor(s:any, tile_set:Anim[]) {
        this.tile_set = tile_set
        for(let i = 0; i < MAP_SIZE; i++) {
            this.map.push(new Array(MAP_SIZE))
        }
    }

    create(s:any) {
        for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
                const noise = s.noise(x*NOISE_MULTIPLIER, y*NOISE_MULTIPLIER)
                const index = Math.floor(noise * this.tile_set.length)
                this.map[y][x] = new Sprite(this.tile_set[index],
                    x, y, TILE_SIZE, TILE_SIZE)
            }
        }
    }
    
    draw(s:any) {
        for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
                this.map[y][x].draw(s, false)
            }
        }
    }
}