const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const MAX_ROOMS = 4;
const MAX_USERS_PER_ROOM = 10;
const ROOM_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

let users = [];
let rooms = {};

function findUser(username) {
    return users.find(user => user.username === username);
}

function createRoom(roomNumber) {
    rooms[roomNumber] = [];
}

function joinRoom(username, roomNumber) {
    if (!rooms[roomNumber]) {
        createRoom(roomNumber);
    }
    rooms[roomNumber].push(username);
}

function leaveRoom(username) {
    Object.keys(rooms).forEach(roomNumber => {
        rooms[roomNumber] = rooms[roomNumber].filter(u => u !== username);
    });
}

function getAvailableRoom() {
    for (let i = 1; i <= MAX_ROOMS; i++) {
        if (!rooms[i] || rooms[i].length < MAX_USERS_PER_ROOM) {
            return i;
        }
    }
    return null; // No available rooms
}

io.on('connection', socket => {
    console.log('User connected');

    socket.on('join', (username, roomNumber) => {
        if (users.length >= MAX_ROOMS * MAX_USERS_PER_ROOM) {
            socket.emit('roomFull');
            return;
        }

        if (findUser(username)) {
            socket.emit('usernameExists');
            return;
        }

        const availableRoom = getAvailableRoom();
        if (!availableRoom) {
            socket.emit('noAvailableRooms');
            return;
        }

        users.push({ username, socketId: socket.id });
        socket.join(availableRoom.toString());
        socket.to(availableRoom.toString()).broadcast.emit('userJoined', username);
        joinRoom(username, availableRoom.toString());

        setTimeout(() => {
            leaveRoom(username);
            socket.leave(availableRoom.toString());
        }, ROOM_TIMEOUT);
    });

    socket.on('message', (username, roomNumber, message) => {
        io.to(roomNumber).emit('message', username, message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        users = users.filter(user => user.socketId !== socket.id);
        Object.keys(rooms).forEach(roomNumber => {
            rooms[roomNumber] = rooms[roomNumber].filter(username => username !== findUser(username).username);
        });
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
