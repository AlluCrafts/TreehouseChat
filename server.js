const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const MAX_USERS_PER_ROOM = 10;
const ROOM_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

// Initialize rooms object with four rooms: 1, 2, 3, and 4
let rooms = {
    '1': [],
    '2': [],
    '3': [],
    '4': []
};

function findUser(username) {
    for (const roomNumber in rooms) {
        if (rooms.hasOwnProperty(roomNumber)) {
            if (rooms[roomNumber].find(user => user.username === username)) {
                return true;
            }
        }
    }
    return false;
}

function joinRoom(username, roomNumber) {
    rooms[roomNumber].push({ username });
}

function leaveRoom(username) {
    for (const roomNumber in rooms) {
        if (rooms.hasOwnProperty(roomNumber)) {
            rooms[roomNumber] = rooms[roomNumber].filter(user => user.username !== username);
        }
    }
}

function getAvailableRoom() {
    for (const roomNumber in rooms) {
        if (rooms.hasOwnProperty(roomNumber)) {
            if (rooms[roomNumber].length < MAX_USERS_PER_ROOM) {
                return roomNumber;
            }
        }
    }
    return null; // No available rooms
}

io.on('connection', socket => {
    console.log('User connected');

    socket.on('join', (username, roomNumber) => {
        if (findUser(username)) {
            socket.emit('usernameExists');
            return;
        }

        const availableRoom = getAvailableRoom();
        if (!availableRoom) {
            socket.emit('noAvailableRooms');
            return;
        }

        // Add the user to the room
        joinRoom(username, availableRoom);
        socket.join(availableRoom);

        // Notify other users in the room about the new user
        socket.to(availableRoom).broadcast.emit('userJoined', username);

        // Schedule user to leave the room after timeout
        setTimeout(() => {
            leaveRoom(username);
            socket.leave(availableRoom);
        }, ROOM_TIMEOUT);
    });

    socket.on('message', (username, roomNumber, message) => {
        io.to(roomNumber).emit('message', username, message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
