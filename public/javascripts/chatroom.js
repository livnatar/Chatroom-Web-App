


(function() {

    document.addEventListener('DOMContentLoaded', function () {

        fetchMessages();







    });

    const fetchMessages = async function () {
        try {
            const response = await fetch('/chatrooms');
        }

        fetch('/messages')
            .then(response => response.json())
            .then(messages => {
                const messagesContainer = document.getElementById('messages-container');
                messages.forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.innerHTML = `
                <p>${msg.username}: ${msg.message} <span>${new Date(msg.timestamp).toLocaleString()}</span></p>
                ${msg.isOwnedByUser ? `
                    <button class="edit-button" data-message-id="${msg.id}">Edit</button>
                    <button class="delete-button" data-message-id="${msg.id}">Delete</button>
                ` : ''}
            `;
                    messagesContainer.appendChild(messageDiv);
                });
            })
            .catch(error => console.error('Error fetching messages:', error));

    }













})();