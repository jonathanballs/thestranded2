import { createServer, Server } from 'http';
import * as path from 'path';
import SocketIO from 'socket.io';
import express from 'express';
import joi from 'joi';

import { GameRoom, Player } from './gamestate';
import { thisExpression, throwStatement } from 'babel-types';

const NETWORK_TICK_MS = 500;

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

// Handle socket.io connections
io.on('connection', function (socket) {

    let room: GameRoom;
    let roomName: string;
    let playerId: string;

    socket.on('disconnect', () => {
        // Remove player from game
        delete this.room.players[this.userId];
    });

    // Add the client to a server when they request to join a room
    socket.on('joinRoom', (userDetailsRaw: any) => {
        console.log(`Connection recieved from ${socket.id}`);
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
            this.playerId = p.id;
            this.roomName = userDetails.roomName;
            this.room = rooms[this.roomName];
            socket.join(this.roomName);

            socket.emit('joinRoom', {
                player: p,
                room: {
                    name: this.roomName,
                    seed: rooms[this.roomName].seed,
                }
            });
        }).catch((err: any) => {
            console.log(err);
            socket.emit('serverError', `joinRoom: ${JSON.stringify(userDetailsRaw)}: ${err}`);
        })
    })

    socket.on('playerUpdateState', (pStateRaw) => {
        const schema = joi.object().keys({
            timestamp: joi.date(),
            latency: joi.number(),
            pos: joi.object().keys({
                x: joi.number(),
                y: joi.number(),
            }).required(),
            rotation: joi.number(),
            velocity: joi.number(),
        }).required();

        joi.validate(pStateRaw, schema).then(pState => {
            const ps = this.room.players;
            ps[this.playerId].pos = pState.pos;
            ps[this.playerId].rotation = pState.rotation;
            ps[this.playerId].currentVelocity = pState.velocity;
            ps[this.playerId].timestampUpdated = Date.now();
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
    });
}, 1000)
