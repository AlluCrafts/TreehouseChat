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
}

socket.on('joinSuccess', (roomNumber) => {
    document.getElementById("welcome").style.display = "none";
    document.getElementById("chatRoom").style.display = "block";
    window.location.hash = `room${roomNumber}`; // Redirect to the specific chat room
});

socket.on('message', (sender, message) => {
    appendMessage(sender, message);
});

socket.on('userJoined', (username) => {
    appendMessage('System', `${username} joined the room`);
});

function sendMessage() {
    const message = document.getElementById("messageInput").value.trim();
    if (message === "") {
        alert("Please enter a message!");
        return;
    }

    socket.emit('message', username, roomNumber, message);

    document.getElementById("messageInput").value = "";
}

function appendMessage(sender, message) {
    const chatArea = document.getElementById("chatArea");
    const messageElement = document.createElement("div");
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatArea.appendChild(messageElement);
}
