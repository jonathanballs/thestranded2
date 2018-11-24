export const DEBUG = true

export var debug = (...args: any[]) => { }

if (DEBUG) {
    debug = console.log
}
