export const DEBUG = true
export const TILE_SIZE = 10
export const CANVAS_SIZE = [800,600]

export var debug = (...args: any[]) => { }

if (DEBUG) {
    debug = console.log
}
