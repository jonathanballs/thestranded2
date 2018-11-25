// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Sprite from './Sprite'
import Player from './Player'
import Anim from './Animation'
import Background from './Background'
import Projectile from './Projectile'
import Human from './Sprite'
import {DEBUG, CANVAS_SIZE, TILE_SIZE, NETWORK_TICK_MS, GC_COUNT, debug} from './utils'
import io from 'socket.io-client';

let socket:SocketIOClient.Socket// = io();

const [width, height] = CANVAS_SIZE
var gcCounter = GC_COUNT;
var playerId:string;
var playerAnim:Anim
var player:Sprite
var projectlieImage:p5.Image
var projectiles:Projectile[] = []
var background:Background;
var lastUpdate = 0
let serverLatency = 0;
let serverTimeOffset = 0; // ms ahead that the server is
const getServerTime = (): number => { return +new Date + serverTimeOffset}
var tile_set:Anim[]

let gameState:any = {
    players: {},
    bullets: {}
}

const sketch = (s:any) => {
    s.preload = () => {
        playerAnim = new Anim(s, '/static/imgs/blue.png', '/static/imgs/blue_walk.png')
        tile_set = [
            s.loadImage('/static/imgs/water.png'),
            s.loadImage('/static/imgs/dirt.png'),
            s.loadImage('/static/imgs/grass.png')
        ]
        background = new Background(s, tile_set)
        projectlieImage = s.loadImage('/static/imgs/blue.png')
    }
    s.setup = () => {
        socket = io()
        listen()
        s.createCanvas(width, height)
        s.imageMode(s.CENTER)
        s.rectMode(s.CENTER)
        player = new Player(playerAnim, 200, 200)
        player.data.x = 5
        player.data.y = 5
        background.addPlayer(player)
        lastUpdate = Date.now()
        // s.translate(width/2, height/2)
        background.create(s)
        window.onresize = () => {
            s.resizeCanvas(window.innerWidth, window.innerHeight)
        }
    }
    s.draw = () => {
        s.background(255)
        s.push()

        const curTime = Date.now()
        const timeDiff = curTime - lastUpdate
        // CAMERA
        s.translate(
            (width/2 - (player.data.x * TILE_SIZE)),
            (height/2 - (player.data.y * TILE_SIZE))
        )
        // BACKGROUND
        background.draw(s)

        // Player
        player.draw(s)
        player.update(timeDiff, s)

        // Draw gamestate
        const hIds = Object.keys(gameState.players)
        for(let i=0; i < hIds.length; i++) {
            const human: Human = gameState.players[hIds[i]]
            human.draw(s)
            human.update(timeDiff, s)
        }

        // Projectiles
        for(let i = 0; i < projectiles.length; i++) {
            if(projectiles[i].alive == false) {
                projectiles.splice(i, 1)
                continue
            }
            projectiles[i].update(timeDiff, s)
            projectiles[i].draw(s)
        }

        // Event loop stuff
        lastUpdate = curTime
        if(DEBUG) {
            s.fill('black')
            s.stroke('red')
            s.rect(0,0, 2, 10)
            s.rect(0,0, 10, 2)
        }
        s.pop()
    }
    s.mouseClicked = () => {
        const distance = 0.5
        const deltaX = distance * Math.cos(player.data.rot)
        const deltaY = distance * Math.sin(player.data.rot)
        const projectile = new Projectile(
            projectlieImage,
            player.data.x + deltaX,
            player.data.y + deltaY,
            player.data.rot)

        // Send bullet to the server
        socket.emit('playerFiresBullet', {
            shotBy: playerId,
            data: projectile.data
        });

        projectiles.push(projectile) 

    }
}

//@ts-ignore
const P5 = new p5(sketch)

// Socket.io connection
function listen() {
    socket.on('connect', () => {
        console.log("Connected to websocket");

        startLatencyDetection(socket);
        // Join a room
        socket.emit('joinRoom', {
            name: 'jonny',
            mode: 'player',
        });

        // Recieve back player and room data
        socket.on('joinRoom', (roomData: any) => {
            console.log(roomData);
            if(roomData.player != null) {
                playerId = roomData.player.id
            }
        })

        socket.on('serverError', (err: any) => {
            console.log(err)
            console.error(`[SERVER ERROR] ${err}`)
        });

        // When a game snapshot is received from the server
        socket.on('mapSnapshot', (snapshot: any) => {
            const playerIds = Object.keys(snapshot.players)
            for(let id of playerIds) {
                if(id == playerId) { continue }
                // console.log(id, playerId)
                const human = snapshot.players[id]
                if(gameState.players[id] == null) {
                    debug(`${playerId} has joined`)
                    gameState.players[id] = new Human(playerAnim, human.data.x, human.data.y)
                } else {
                    // debug(`${playerId} has been updated`)
                    gameState.players[id].data = human.data
                }
            }
            for(let bullet of snapshot.bullets) {
                if(bullet.shotBy == playerId) {
                    continue
                }
                const bulletId = `${bullet.shotBy}-${bullet.timestampUpdated}`
                if(gameState.bullets[bulletId] == null) {
                    debug(`creating bullet with id ${bulletId}`)
                    debug(bullet)
                    const projectile = new Projectile(
                        projectlieImage,
                        bullet.data.x,
                        bullet.data.y,0)
                    projectile.data.velX = bullet.data.velX
                    projectile.data.velY = bullet.data.velY
                    gameState.bullets[bulletId] = bullet
                    projectiles.push(projectile)
                }
            }
            gcCounter--;
            if(gcCounter == 0) {
                debug('Attempt to GC')
                gcCounter = GC_COUNT
                const humanIds = Object.keys(gameState.players)
                for(let humanId of humanIds) {
                    if(snapshot.players[humanId] == null) {
                        debug(`Player ${humanId} has dced`)
                        delete gameState.players[humanId]
                    }
                }
            }
        });
    });
}

// Periodically pings the server and detects latency
function startLatencyDetection(socket: SocketIOClient.Socket) {
    let start = Date.now();
    let n = 0;
    socket.on('strandedPong', (ret: any) => {
        serverLatency = Date.now() - start;
        if (ret.n != n) return; // Wrong pong
        const serverTimeOffset = ret.timestamp - (Date.now() - serverLatency/2);
    })

    socket.emit('strandedPing', n);
    setInterval(() => {
        start = Date.now();
        socket.emit('strandedPing', ++n);
    }, 1000)
}

// Send player location to server periodically
setInterval(() => {
    if (!player) return;
    const p = {
        timestamp: getServerTime(),
        latency: serverLatency,
        data: player.data
    }
    socket.emit('playerUpdateState', p);
}, NETWORK_TICK_MS);
