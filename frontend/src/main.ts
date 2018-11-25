// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import Sprite from './Sprite'
import Player from './Player'
import Anim from './Animation'
import Background from './Background'
import Projectile from './Projectile'
import Human from './Human'
import Zombie from './Zombie'
import {
    DEBUG,
    CANVAS_SIZE,
    TILE_SIZE,
    NETWORK_TICK_MS,
    GC_COUNT,
    FIRE_RATE,
    debug
} from './utils'
import io from 'socket.io-client';
import { globalAgent } from 'https';

let socket:SocketIOClient.Socket// = io();

const [width, height] = CANVAS_SIZE
var SPECTATOR = false
var gcCounter = GC_COUNT;
var playerId:string;
var playerAnim:Anim
var zombieAnim:Anim
var player:Sprite
var projectlieImage:p5.Image
var projectiles:Projectile[] = []
var background:Background;
var lastUpdate = 0
var lastShot = Date.now()
let serverLatency = 0;
let serverTimeOffset = 0; // ms ahead that the server is
const getServerTime = (): number => { return +new Date + serverTimeOffset}
var tile_set:Anim[]

let gameState:any = {
    players: {},
    bullets: {},
    enemies: {}
}

const sketch = (s:any) => {
    s.preload = () => {
        playerAnim = new Anim(s, '/static/imgs/blue.png', '/static/imgs/blue_walk.png')
        zombieAnim = s.loadImage('/static/imgs/zombie.png')
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
        player = new Player(playerId, playerAnim, 200, 200)
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
        if(!SPECTATOR) {
            s.translate(
                (width/2 - (player.data.x * TILE_SIZE)),
                (height/2 - (player.data.y * TILE_SIZE))
            )
        }else{
            s.translate(
                (width/2 - (player.data.x * TILE_SIZE)),
                (height/2 - (player.data.y * TILE_SIZE))
            )
            s.scale(0.5)

        }
        // BACKGROUND
        background.draw(s)

        // Player
        player.draw(s)
        player.update(timeDiff, s, background)

        // Draw gamestate
        const hIds = Object.keys(gameState.players)
        for(let i=0; i < hIds.length; i++) {
            const human: Human = gameState.players[hIds[i]]
            human.draw(s)
            human.update(timeDiff, s)
        }

        const zIds = Object.keys(gameState.enemies)
        for(let i=0; i < zIds.length; i++) {
            const zombie: Zombie = gameState.enemies[zIds[i]]
            if(zombie.isColliding(s,player)) {
                player.data.health.cur -= 1
                if(player.data.health.cur <= 0) {
                    gg(s, player.data.id);
                }
            }
            zombie.draw(s)
            projectiles.forEach((proj,i) => {
                if(proj.isColliding(s, zombie)) {
                    socket.emit('collision', {
                        zombie: zombie.data.id,
                        bullet: proj.data.id,
                    })
                    projectiles.splice(i, 1)
                }
            })
        }

        // Projectiles
        for(let i = 0; i < projectiles.length; i++) {
            if(projectiles[i].alive == false) {
                socket.emit('destroyBullet', {
                    id: projectiles[i].data.id
                })
                projectiles.splice(i, 1)
                continue
            }
            // projectiles[i].update(timeDiff, s)
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

        // Draw the leaderboard
        const leaderBoard = Object
            .keys(gameState.players)
            .map(k => gameState.players[k])
            .concat([player])
            .sort((a, b) => a.points - b.points)
        console.log(leaderBoard);
        leaderBoard.forEach((p, i) => {
            s.textSize(20);
            s.text(`${p.name}(${p.latency ? p.latency: 0} ms)`, 5, 20*(i+1))
            s.text(`${p.points}`, 200, 20*(i+1))
        });
    }
    s.mouseClicked = () => {
        if(Date.now() - lastShot < FIRE_RATE) {
            return
        }
        lastShot = Date.now()
        const distance = 0.5
        const deltaX = distance * Math.cos(player.data.rot)
        const deltaY = distance * Math.sin(player.data.rot)
        const projectile = new Projectile(
            `bullet-${playerId}-${Date.now().toString()}`,
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

function gg(s:any, deadPlayerId: string) {
    console.log(gg)
    socket.disconnect()
    s.noLoop()
    document.getElementById('defaultCanvas0').style.filter = 'saturate(0.2%'
    socket.emit('playerKilled', { playerId: deadPlayerId });
}

//@ts-ignore
const P5 = new p5(sketch)

// Socket.io connection
function listen() {
    socket.on('connect', () => {
        console.log("Connected to websocket");

        startLatencyDetection(socket);
        // Join a room
        if(location.search.indexOf('?spectate=true') == -1) {
            socket.emit('joinRoom', {
                name: location.search.split('name=')[1],
                mode: 'player',
            });
            player.name = location.search.split('name=')[1];
        } else {
            SPECTATOR = true
            socket.emit('joinRoom', {
                name: location.search.split('name=')[1],
                mode: 'spectator',
            });
        }

        // Recieve back player and room data
        socket.on('joinRoom', (roomData: any) => {
            console.log(roomData);
            if(roomData.player != null) {
                playerId = roomData.player.data.id
            }
        })

        socket.on('serverError', (err: any) => {
            console.log(err)
            console.error(`[SERVER ERROR] ${err}`)
        });

        // When a game snapshot is received from the server
        socket.on('mapSnapshot', (snapshot: any) => {
            //handle players
            const playerIds = Object.keys(snapshot.players)
            for(let id of playerIds) {
                if(id == playerId) { continue }
                const human = snapshot.players[id]
                if(gameState.players[id] == null) {
                    debug(`${playerId} has joined`)
                    gameState.players[id] = new Human(id, playerAnim, human.data.x, human.data.y)
                    gameState.players[id].name = snapshot.players[id].name;
                    gameState.players[id].latency = snapshot.players[id].latency;
                } else {
                    // debug(`${playerId} has been updated`)
                    gameState.players[id].data = human.data
                    gameState.players[id].name = human.name
                    gameState.players[id].latency = human.latency
                    // console.log(gameState.players[id]);
                }
            }
            //handle zombies
            const zombieIds = Object.keys(snapshot.enemies)
            for(let id of zombieIds) {
                const zombie = snapshot.enemies[id]
                if(gameState.enemies[id] == null) {
                    debug(`${id} spawned`)
                    gameState.enemies[id] = new Zombie(id, zombieAnim, zombie.data.x, zombie.data.y)
                } else {
                    gameState.enemies[id].data = zombie.data
                }
            }
            //handle bullets
            for(let bullet of snapshot.bullets) {
                if(bullet.shotBy == playerId) {
                    continue
                }
                const bulletId = bullet.data.id
                if(gameState.bullets[bulletId] == null) {
                    debug(`creating bullet with id ${bulletId}`)
                    debug(bullet)
                    const projectile = new Projectile(
                        bulletId,
                        projectlieImage,
                        bullet.data.x,
                        bullet.data.y,0)
                    projectile.data = bullet.data
                    gameState.bullets[bulletId] = bullet
                    projectiles.push(projectile)
                }
            }
            //garbage collector
            gcCounter--;
            if(gcCounter == 0) {
                debug('Attempt to GC')
                gcCounter = GC_COUNT
                const humanIds = Object.keys(gameState.players)
                for(let humanId of humanIds) {
                    if(snapshot.players[humanId] == null) {
                        debug(`Player ${humanId} has died`)
                        delete gameState.players[humanId]
                    }
                }
                const zombieIds = Object.keys(gameState.enemies)
                for(let zombieId of zombieIds) {
                    if(snapshot.enemies[zombieId] == null) {
                        debug(`Zombie ${zombieId} has died`)
                        delete gameState.enemies[zombieId]
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
