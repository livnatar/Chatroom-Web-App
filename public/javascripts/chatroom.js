
//import { ChatroomUIModule } from './chatroomUI.js';

(function() {

    document.addEventListener('DOMContentLoaded', function () {

        //fetch messages from database if there are any
        Manager.fetchAndDisplayMessages().catch(error => {console.log(error)});

        // display messages every 10 seconds
        setInterval(Manager.fetchAndDisplayMessages, 10000);

    });

const Manager = (function (){

    const fetchAndDisplayMessages = async function () {
        const messages = await ChatroomAPI.fetchMessages();
        ChatroomUIModule.displayMessages(messages);
    }

    /***
     This function is responsible for checking if there's an existing session
     ***/
    const checkSession = async function (msgId) {
        try {
            const response = await fetch('/check-session', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({msgId})
            });

            // Validate the response status
            const validateResponse = await ChatroomAPI.status(response);

            // Parse the response and check if the session is authenticated
            const session = await response.json();
            return session.authenticated;
        }
        catch (error) {
            console.error('Error checking session:', error);
            return false;
        }
        
    }

    const handleEdit = async function (msgId){
        try {
            if (await checkSession(msgId)) {
                ChatroomUIModule.editMsg(msgId);
            }
            else {
                // no session, redirect to login
                window.location.href = '/login';
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleSave = async function (msgId, newInput){
        try {
            if (await checkSession(msgId)) {
                // means the session is valid

                // fetch that finds the message and changes it's content
                const response = await fetch('/save-msg', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({msgId, newInput})
                });

                const validateResponse = await ChatroomAPI.status(response);
                const message = await response.json();

                if (message.updated) {
                    // in order to show the updated message
                    ChatroomUIModule.saveMsg(msgId, newInput);
                }
                else {
                    console.log("Failed to update the message");
                }
            }
            else {
                // If no session, redirect to login
                window.location.href = '/login';
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleCancel = async function (msgId, editedInput, originalInput){
        try {
            if (await checkSession(msgId)) {
                ChatroomUIModule.cancelMsg(msgId, editedInput, originalInput);
            }
            else {
                // no session, redirect to login
                window.location.href = '/login';
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    const handleDelete = async function (msgId){

        try {
            if (await checkSession(msgId)) {

                // find and delete message from database
                const response = await fetch('/find-and-delete-msg', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({msgId})
                });
                const validateResponse = await ChatroomAPI.status(response);
                const message = await response.json();

                if (message.deleted) {
                    fetchAndDisplayMessages().catch(error => {console.log(error)});
                }
                else {
                    console.log("Failed to delete the message");
                }
            }
            else {
                // no session, redirect to login
                window.location.href = '/login';
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    return {
        fetchAndDisplayMessages,
        handleEdit,
        handleDelete,
        handleCancel,
        handleSave
    }

})();

const ChatroomAPI = (function() {

    const fetchMessages = async function () {
        try {
            const response = await fetch('/existingMessages');
            const validResponse = await status(response);
            return await response.json();
        }
        catch (error) {
            console.log(`Error fetching messages from database: ${error}`);
        }
    }

    function status(response) {

        if (response.status >= 200 && response.status < 300) {
            return response
        }
        else {
            window.location.href = '/error';
            return Promise.reject(new Error("Couldn't find any response"));
        }
    }


    return {
        fetchMessages,
        status
    }

})();

const ChatroomUIModule = (function() {

    // Function to display messages in the chat area
    const displayMessages = function (messages) {

        const chatMessagesDiv = document.getElementById('chatMessages');

        // Clear existing messages
        chatMessagesDiv.innerHTML = '';

        // Loop through each message and create a Bootstrap card for it
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('card', 'mb-3');  // Add Bootstrap card classes

            messageDiv.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${msg.username}</h5>
                    <p class="card-text">${msg.message}</p>
                    <footer class="blockquote-footer">
                        <small>
                            ${new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(new Date(msg.timestamp))}
                            -
                            ${new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            }).format(new Date(msg.timestamp))}
                        </small>
                    </footer>
                    ${msg.isOwnedByUser ? ` 
                        <button class="edit-button btn btn-warning" data-message-id="${msg.id}">Edit</button>
                        <button class="delete-button btn btn-danger" data-message-id="${msg.id}">Delete</button>
                    ` : ''}
                </div>
            `;

            chatMessagesDiv.appendChild(messageDiv);

            // Event listener for Edit button
            const editButton = messageDiv.querySelector('.edit-button');
            if (editButton) {
                editButton.addEventListener('click', () => Manager.handleEdit(msg.id));
            }

            // Event listener for Delete button
            const deleteButton = messageDiv.querySelector('.delete-button');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => Manager.handleDelete(msg.id));
            }
        });
    };

    const editMsg  = function (msgId) {

        // Find the message card using the msgId
        const messageElement = document.querySelector(`[data-message-id="${msgId}"]`).closest('.card-body');

        if (!messageElement) {
            console.error('Message element not found for ID:', msgId);
            return;
        }

        // Get the current message text
        const messageTextElement = messageElement.querySelector('.card-text');
        const currentMessageText = messageTextElement.textContent;

        // Create a text input for editing the message
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.classList.add('form-control', 'mb-2'); // Add Bootstrap styles
        editInput.value = currentMessageText; // Pre-fill with the current message
        editInput.required = true; // Make the input required


        // Replace the message text with the input field
        messageTextElement.replaceWith(editInput);

        // Get the edit button and change it to a save button
        const editButton = messageElement.querySelector(`.edit-button[data-message-id="${msgId}"]`);
        editButton.textContent = 'Save';
        editButton.classList.remove('btn-warning');
        editButton.classList.add('btn-success');

        // Change the delete button to a cancel button
        const deleteButton = messageElement.querySelector(`.delete-button[data-message-id="${msgId}"]`);
        deleteButton.textContent = 'Cancel';
        deleteButton.classList.remove('btn-danger');
        deleteButton.classList.add('btn-secondary');

        // Remove the current listeners and add new ones
        deleteButton.removeEventListener('click', Manager.handleDelete); // Remove delete behavior
        deleteButton.addEventListener('click', () => Manager.handleCancel(msgId, editInput, currentMessageText)); // Add cancel behavior

        // Remove the edit button listener and add a save listener
        editButton.removeEventListener('click', Manager.handleEdit);
        editButton.addEventListener('click', () => Manager.handleSave(msgId, editInput));
    };


    const cancelMsg = function (msgId, editInput, originalMessageText) {

        // Restore the original message text
        const messageElement = editInput.closest('.card-body');
        const messageTextElement = document.createElement('p');
        messageTextElement.classList.add('card-text');
        messageTextElement.textContent = originalMessageText;
        editInput.replaceWith(messageTextElement);

        // Reset the buttons
        const editButton = messageElement.querySelector(`.edit-button[data-message-id="${msgId}"]`);
        editButton.textContent = 'Edit';
        editButton.classList.remove('btn-success');
        editButton.classList.add('btn-warning');
        editButton.removeEventListener('click', manager.handleSave);
        editButton.addEventListener('click', () => Manager.HandleEdit(msgId));

        const deleteButton = messageElement.querySelector(`.delete-button[data-message-id="${msgId}"]`);
        deleteButton.textContent = 'Delete';
        deleteButton.classList.remove('btn-secondary');
        deleteButton.classList.add('btn-danger');
        deleteButton.removeEventListener('click', handleCancel);
        deleteButton.addEventListener('click', () => handleDelete(msgId));
    };


    const saveMsg =  function (msgId, editInput) {

        // Ensure the input field is required
        editInput.required = true;

        // Trigger validation by checking the validity of the input
        if (!editInput.checkValidity()) {
            editInput.reportValidity(); // Show browser's native validation message
            return;
        }

        // Get the new message text
        const newMessageText = editInput.value.trim();

        // Replace the input field with the new message text
        const newMessageElement = document.createElement('p');
        newMessageElement.classList.add('card-text');
        newMessageElement.textContent = newMessageText;
        editInput.replaceWith(newMessageElement);

        // Get the save button and change it back to an edit button
        const saveButton = document.querySelector(`.edit-button[data-message-id="${msgId}"]`);
        saveButton.textContent = 'Edit';
        saveButton.classList.remove('btn-success');
        saveButton.classList.add('btn-warning');

        // Remove the current save listener and add an edit listener
        saveButton.removeEventListener('click', Manager.handleSave);
        saveButton.addEventListener('click', () => Manager.handleEdit(msgId));

        // Get the "Cancel" button and change it back to "Delete"
        const cancelButton = document.querySelector(`.delete-button[data-message-id="${msgId}"]`);
        cancelButton.textContent = 'Delete';
        cancelButton.classList.remove('btn-secondary');
        cancelButton.classList.add('btn-danger');
        cancelButton.removeEventListener('click', Manager.handleCancel);
        cancelButton.addEventListener('click', () => Manager.handleDelete(msgId));

        // Log the update to the console
        console.log(`Message with ID ${msgId} updated to: "${newMessageText}"`);
    };


    return {
        displayMessages,
        editMsg,
        cancelMsg,
        saveMsg
    };

})();

})();