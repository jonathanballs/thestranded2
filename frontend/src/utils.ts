export const DEBUG = true
export const TILE_SIZE = 10

export var debug = (...args: any[]) => { }

if (DEBUG) {
    debug = console.log
}
