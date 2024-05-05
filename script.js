let username;
let roomNumber;
let socket = io();

function joinRoom() {
    username = document.getElementById("username").value.trim();
    roomNumber = document.getElementById("roomNumber").value.trim();

    if (username === "" || roomNumber === "") {
        alert("Please enter both username and room number!");
        return;
    }

    socket.emit('join', username, roomNumber);

    document.getElementById("welcome").style.display = "none";
    document.getElementById("chatRoom").style.display = "block";
}

function sendMessage() {
    const message = document.getElementById("messageInput").value.trim();
    if (message === "") {
        alert("Please enter a message!");
        return;
    }

    socket.emit('message', username, roomNumber, message);

    document.getElementById("messageInput").value = "";
}

socket.on('message', (sender, message) => {
    appendMessage(sender, message);
});

socket.on('userJoined', (username) => {
    appendMessage('System', `${username} joined the room`);
});

socket.on('roomFull', () => {
    alert('The room is full. Please try another room.');
});

socket.on('usernameExists', () => {
    alert('Username already exists. Please choose another username.');
});

socket.on('noAvailableRooms', () => {
    alert('No available rooms at the moment. Please try again later.');
});

function appendMessage(sender, message) {
    const chatArea = document.getElementById("chatArea");
    const messageElement = document.createElement("div");
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatArea.appendChild(messageElement);
}
