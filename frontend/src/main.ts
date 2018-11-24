/// <reference path="../types//p5.global-mode.d.ts" />

const DEBUG = true
let debug = (...args: any[]) => {}
if(DEBUG) {
    debug = console.log
}

let playerAnim:Anim;
let player:Sprite;
// @ts-ignore
function preload() {
    playerAnim = new Anim('/static/imgs/blue.png', '/static/imgs/blue_walk.png')
}

function setup() {
    createCanvas(800,600)
    // @ts-ignore
    imageMode(CENTER)
    // @ts-ignore
    rectMode(CENTER)
    player = new Sprite(playerAnim, 200, 200)
}

function draw() {
    background(255)
    player.x = mouseX
    player.y = mouseY
    player.draw()
}

class Sprite {
    x:number
    y:number
    width:number
    height:number
    look: Anim | p5.Image
    constructor(look:Anim | p5.Image, x:number, y:number, width?:number, height?:number) {
        this.x = x
        this.y = x
        if(width != null && height != null) {
            this.width = width
            this.height = height
        } else if(look instanceof Anim) {
            [this.width, this.height] = [look.imageList[0].width, look.imageList[0].height]
        } else {
            [this.width, this.height] = [look.width, look.height]
        }
        this.look = look
    }

    draw() {
        if(this.look instanceof Anim) {
            image(this.look.imageList[0], this.x, this.y, this.width, this.height)
        } else {
            image(this.look, this.x, this.y, this.width, this.height)
        }
        if(DEBUG) {
            stroke(255, 0, 0)
            noFill()
            rect(this.x, this.y, this.width, this.height)
        }
    }
}

class Anim {
    imageList: p5.Image[]

    constructor(...imgs: string[]) {
       this.imageList = imgs.map((location) => {
           debug(`Loading image: ${location}`)
           return loadImage(location)
       })
    }
}