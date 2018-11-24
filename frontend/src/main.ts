// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Sprite from './Sprite'
import Player from './Player'
import Anim from './Animation'
import Background from './Background'
import {DEBUG, CANVAS_SIZE, TILE_SIZE} from './utils'
import io from 'socket.io-client';

const [width, height] = CANVAS_SIZE
var playerAnim:Anim;
var player:Sprite;
var background:Background;
var lastUpdate = 0
var tile_set:Anim[]

const sketch = (s:any) => {
    s.preload = () => {
        playerAnim = new Anim(s, '/static/imgs/blue.png', '/static/imgs/blue_walk.png')
        tile_set = [
            new Anim(s, '/static/imgs/water.png'),
            new Anim(s, '/static/imgs/dirt.png'),
            new Anim(s, '/static/imgs/grass.png')
        ]
        background = new Background(s, tile_set)
    }
    s.setup = () => {
        s.createCanvas(width, height)
        s.imageMode(s.CENTER)
        s.rectMode(s.CENTER)
        player = new Player(playerAnim, 200, 200)
        player.x = 5
        player.y = 5
        lastUpdate = Date.now()
        // s.translate(width/2, height/2)
        background.create(s)
    }
    s.draw = () => {
        s.background(255)
        s.push()

        s.stroke(255, 0, 0)
        s.noFill()
        s.ellipse(0,0, 50)
        const curTime = Date.now()
        // CAMERA
        s.translate(
            width/2 - (player.x * TILE_SIZE),
            height/2 - (player.y * TILE_SIZE)
        )
        // BACKGROUND
        background.draw(s)

        player.update(curTime - lastUpdate, s)
        player.draw(s)

        lastUpdate = curTime
        if(DEBUG) {
            s.fill('black')
            s.stroke('red')
            s.ellipse(0,0, 10)
        }
        s.pop()
    }
}

//@ts-ignore
const P5 = new p5(sketch)


// Socket.io connection
const socket = io();
socket.on('connect', () => {
    console.log("Connected to websocket");
    socket.emit('joinRoom', {
        name: 'jonny',
        mode: 'player',
    });

    socket.on('joinRoom', (roomData: any) => {
        console.log(roomData);
    })

    socket.on('serverError', (err: any) => {
        console.log(err)
        console.error(`[SERVER ERROR] ${err}`)
    });
});


