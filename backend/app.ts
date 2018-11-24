import { createServer, Server } from 'http';
import * as path from 'path';
import SocketIO from 'socket.io';
import express from 'express';
import joi from 'joi';

import { GameRoom, Map, Player } from './gamestate';

// Create server
const app = express();
const server = createServer(app);
const socket = SocketIO(server);

// Configure templating
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// Render index.html
app.get('/', (req, res) => {
    res.render('index', {
        title: "The Template",
    });
});

// Finally serve the application
const port = process.env['PORT'] || 8081;
server.listen(port, () => {
    console.log("Stranded server started on port " + port);
});

const rooms: GameRoom[] = [];

// Handle socket.io connections
socket.on('connection', function (socket) {
    console.log(`Connection recieved from ${socket.id}`);

    socket.on('joinRoom', (userDetailsRaw) => {
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
                socket.emit('joinRoom', { status: `Creating room ${roomName}`});
                rooms[roomName] = new GameRoom(roomName);
            }

            // Create player and add to room
            const p = new Player(userDetails.name, userDetails.characterSpriteId);
            rooms[userDetails.roomName].addPlayer(p);

            // Save user details to the socket object
            this.userId = p.id;
            this.roomName = userDetails.roomName;

            socket.emit('joinRoom', {
                player: p,
                room: {
                    name: this.roomName,
                    seed: rooms[this.roomName].seed,
                }
            });
        }).catch((err) => {
            socket.emit('serverError', `Bad input to joinRoom: ${userDetailsRaw}: ${err}`);
        })
    })
});
