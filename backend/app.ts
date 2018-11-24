import { createServer, Server } from 'http';
import * as path from 'path';
import SocketIO from 'socket.io';
import express from 'express';

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

// Handle socket.io connections
socket.on('connection', function(socket) {
  console.log(`Connection recieved from ${socket.id}`);
});
