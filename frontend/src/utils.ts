export const DEBUG = true
export const TILE_SIZE = 40
export let CANVAS_SIZE = [window.innerWidth,window.innerHeight]
export const NETWORK_TICK_MS = 10;
export const GC_COUNT = 60;
export const FIRE_RATE = 1000;

export var debug = (...args: any[]) => { }

window.onresize = (e) => {
    CANVAS_SIZE = [window.innerWidth,window.innerHeight]
}

if (DEBUG) {
    debug = console.log
}
