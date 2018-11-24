export const DEBUG = true
export const TILE_SIZE = 40
export let CANVAS_SIZE = [window.innerWidth,window.innerHeight]
export const NETWORK_TICK_MS = 50;

export var debug = (...args: any[]) => { }

window.onresize = (e) => {
    CANVAS_SIZE = [window.innerWidth,window.innerHeight]
}

if (DEBUG) {
    debug = console.log
}
