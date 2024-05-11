const express = require('express');
require('dotenv').config();
const dbConnect = require('./config/dbconnect');
const initRoutes = require('./routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(cookieParser());
const port = process.env.PORT || 8888;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
dbConnect();
initRoutes(app);

const server = http.createServer(app);
const io = socketIo(server);


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => {
    console.log('Server running on the port: ' + port);
});
