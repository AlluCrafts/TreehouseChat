function joinRoom() {
    const username = document.getElementById("username").value.trim();
    const roomNumber = document.getElementById("roomNumber").value.trim();

    if (username === "" || roomNumber === "") {
        alert("Please enter both username and room number!");
        return;
    }

    socket.emit('join', username, roomNumber);
}

socket.on('joinSuccess', (roomNumber) => {
    document.getElementById("welcome").style.display = "none";
    document.getElementById("chatRoom").style.display = "block";
    window.location.hash = `room${roomNumber}`;
});

socket.on('message', (username, message) => {
    appendMessage(username, message);
});

socket.on('userJoined', (username) => {
    appendMessage('System', `${username} joined the room`);
});

function appendMessage(sender, message) {
    const chatArea = document.getElementById("chatArea");
    const messageElement = document.createElement("div");
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatArea.appendChild(messageElement);
}
