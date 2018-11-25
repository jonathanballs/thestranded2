import { createServer, Server } from 'http';
import * as path from 'path';
import SocketIO from 'socket.io';
import express from 'express';
import joi, { number } from 'joi';

import { GameRoom, Player, Zombie, Enemy } from './gamestate';
import { thisExpression, throwStatement } from 'babel-types';

const NETWORK_TICK_MS = 10;

// Create server
const app = express();
const server = createServer(app);
const io = SocketIO(server);

// Configure templating
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// Render index.html
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname + '/static/' });
});

// Finally serve the application
const port = process.env['PORT'] || 8081;
server.listen(port, () => {
    console.log("Stranded server started on port " + port);
});

const rooms: { [roomId: string]: GameRoom } = {};

const entityDataSchema = joi.object().keys({
    id: joi.string(),
    x: joi.number(),
    y: joi.number(),
    velX: joi.number(),
    velY: joi.number(),
    rot: joi.number(),
    timestampUpdated: joi.number(),
}).required();

// Handle socket.io connections
io.on('connection', function (socket: any) {

    socket.on('disconnect', () => {
        // Remove player from game
        if (socket.room) {
            delete socket.room.players[socket.playerId];
            console.log(`${socket.playerId} has disconnected`);
        }
    });

    // Add the client to a server when they request to join a room
    socket.on('joinRoom', (userDetailsRaw: any) => {
        const schema = joi.object().keys({
            name: joi.string().alphanum().max(15).required(),
            mode: joi.string().only(['spectator', 'player']).required(),
            roomName: joi.string().optional().default('main'),
            characterSpriteId: joi.string().optional(),
        });

        // Validate the input
        joi.validate(userDetailsRaw, schema).then((userDetails) => {
            if (userDetails.mode == 'spectator') {
                socket.emit('serverError', 'Spectator mode not supported');
                return;
            }

            // Create room if doesn't exist
            if (rooms[userDetails.roomName] == undefined) {
                const { roomName }  = userDetails;
                socket.emit('joinRoom', { status: `Creating room ${roomName}` });
                rooms[roomName] = new GameRoom(roomName);
            }

            // Create player and add to room
            const p = new Player(userDetails.name, userDetails.characterSpriteId);
            rooms[userDetails.roomName].addPlayer(p);

            // Save user details to the socket object
            socket.playerId = p.data.id;
            socket.roomName = userDetails.roomName;
            socket.room = rooms[socket.roomName];
            socket.join(socket.roomName);

            socket.emit('joinRoom', {
                player: p,
                room: {
                    name: socket.roomName,
                    seed: rooms[socket.roomName].seed,
                }
            });
        }).catch((err: any) => {
            console.log(err);
            socket.emit('serverError', `joinRoom: ${JSON.stringify(userDetailsRaw)}: ${err}`);
        })
    })

    socket.on('playerUpdateState', (pStateRaw: any) => {
        if (!socket.playerId) return; // safety

        const schema = joi.object().keys({
            data: entityDataSchema,
            timestamp: joi.date(),
            latency: joi.number(),
        }).required();

        joi.validate(pStateRaw, schema).then(pState => {
            const ps = socket.room.players;
            ps[socket.playerId].data = pState.data;
            ps[socket.playerId].timestampUpdated = Date.now();
        }).catch(err => {
            socket.emit('serverError',
              `playerUpdateState: ${JSON.stringify(pStateRaw)}: ${err}`);
        })
    });

    // Remove bullet from gamestate
    socket.on('destroyBullet', (data:{id:string}) => {
        //@ts-ignore
        const index = socket.room.bullets.map(b => b.data.id).indexOf(data.id)
        socket.room.bullets.splice(index, 1)
        console.log(`${data.id} destroyed`)
    })

    // Remove bullet from gamestate
    socket.on('collision', (data:{zombie:string, bullet:string}) => {
        //@ts-ignore
        const index = socket.room.bullets.map(b => b.data.id).indexOf(data.bullet)
        socket.room.bullets.splice(index, 1)
        console.log(`${data.bullet} destroyed`)
        delete socket.room.enemies[data.zombie]
        console.log(`${data.zombie} destroyed`)
    })

    socket.on('playerFiresBullet', (bulletInfoRaw: any) => {
        const schema = joi.object().keys({
            shotBy: joi.string().required(),
            data: entityDataSchema,
        });

        joi.validate(bulletInfoRaw, schema).then(bulletInfo => {
            bulletInfo.timestampUpdated = Date.now();
            socket.room.bullets.push(bulletInfo);
            // Record bullets onto the location
        }).catch(err => {
            socket.emit('serverError',
              `playerFiresBullet: ${JSON.stringify(bulletInfoRaw)}: ${err}`);
        })
    })

    // Allow clients to calculate latency
    socket.on('strandedPing', (n: number) => {
        socket.emit('strandedPong', { n, timestamp: Date.now() })
    });
});

// Send gamestate to the clients periodically
setInterval(() => {
    Object.keys(rooms).forEach(roomId => {
        const r = rooms[roomId];
        io.to(roomId).emit('mapSnapshot', r);
    })
}, NETWORK_TICK_MS);

function isZombie(enemy: Enemy): enemy is Zombie {
    return enemy.type === 'zombie';
}

// Periodically add enemies and update old ones
setInterval(() => {
    Object.keys(rooms).forEach(roomId => {
        // Add a zombie
        const r = rooms[roomId];

        if (Object.keys(r.enemies).length < 10) {
            r.addEnemy(new Zombie);
        }
        for(let zombieId of Object.keys(r.enemies)) {
            if(isZombie(r.enemies[zombieId])) {
                //@ts-ignore
                r.enemies[zombieId].update(r)
            }
        }
    });
}, 10);
