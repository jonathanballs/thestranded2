import 'p5'
import Sprite from './Sprite'
import Anim from './Animation'
import Tile from './Tile'
import { TILE_SIZE } from './utils'
import Player from './Player';

const MAP_SIZE = 200
const NOISE_MULTIPLIER = 0.1
const DRAW_RADIUS = 30 // Squared

export default class Background {
    tile_set: Anim[]
    map: Sprite[][] = []
    player: Player
    constructor(s:any, tile_set:Anim[]) {
        this.tile_set = tile_set
        for(let i = 0; i < MAP_SIZE; i++) {
            this.map.push(new Array(MAP_SIZE))
        }
    }

    addPlayer(p:Player) {
        this.player = p
    }
    create(s:any) {
        s.noiseSeed(300)
        for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
                const noise = s.noise(x*NOISE_MULTIPLIER, y*NOISE_MULTIPLIER)
                const index = Math.floor(noise * this.tile_set.length)
                this.map[y][x] = new Tile(this.tile_set[index],
                    (x-MAP_SIZE/2), (y-MAP_SIZE/2), TILE_SIZE, TILE_SIZE)
            }
        }
    }
    
    draw(s:any) {
        if(this.player == null){ return }
        for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
                const deltaX = Math.abs((x-MAP_SIZE/2) - this.player.data.x) < 40
                const deltaY = Math.abs((y-MAP_SIZE/2) - this.player.data.y) < 30
                // console.log(distanceFromPlayer)
                if(deltaX && deltaY) {
                    this.map[y][x].draw(s, false)
                }
            }
        }
    }
}