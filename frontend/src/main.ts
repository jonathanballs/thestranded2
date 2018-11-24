// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Sprite from './Sprite'
import Player from './Player'
import Anim from './Animation'
import io from 'socket.io-client';
import {CANVAS_SIZE} from './utils'

const [width, height] = CANVAS_SIZE
var playerAnim:Anim;
var player:Sprite;
var lastUpdate = 0

const sketch = (s:any) => {
    s.preload = () => {
        playerAnim = new Anim(s, '/static/imgs/blue.png', '/static/imgs/blue_walk.png')
    }
    s.setup = () => {
        s.createCanvas(width, height)
        s.imageMode(s.CENTER)
        s.rectMode(s.CENTER)
        player = new Player(playerAnim, 200, 200)
        player.x = 5
        player.y = 5
        lastUpdate = Date.now()
    }
    s.draw = () => {
        const curTime = Date.now()
        s.background(255)
        player.update(curTime - lastUpdate, s)
        player.draw(s)
        lastUpdate = curTime
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


