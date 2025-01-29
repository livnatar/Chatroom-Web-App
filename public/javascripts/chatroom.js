
//import { ChatroomUIModule } from './chatroomUI.js';

const POLLING = 10000 ;

(function() {
    let lastUpdate = null;

    document.addEventListener('DOMContentLoaded', function () {

        //fetch messages from database if there are any
        Manager.fetchAndDisplayMessages().catch(error => {console.log(error)});

        // Event listener for the Save button in the modal
        document.getElementById('saveEditButton').addEventListener('click', ChatroomUIModule.saveMsg);

        document.getElementById('editMessageModal').addEventListener('hidden.bs.modal', Manager.handleCancel); // Handles modal close

        // display messages every 10 seconds
        setInterval(Manager.fetchAndDisplayMessages, POLLING);

    });

const Manager = (function (){

    // const fetchAndDisplayMessages = async function () {
    // try {
    //     const response = await ChatroomAPI.fetchMessages(lastUpdate);
    //     lastUpdate = new Date();
    //
    //     if (response && Array.isArray(response.messages)) {
    //         if (response.messages.length > 0) {
    //             ChatroomUIModule.displayMessages(response.messages);
    //         }
    //         else {
    //             console.log('No messages to display');
    //         }
    //     }
    //     else if (response.error) {
    //         console.error('Error from server:', response.error);
    //     }
    //     else {
    //         console.log('Unexpected response format:', response);
    //     }
    // }
    // catch (error) {
    //     console.error('Error fetching messages:', error);
    // }
//}

    const fetchAndDisplayMessages = async function () {
        try {
            const response = await ChatroomAPI.fetchMessages(lastUpdate);
            lastUpdate = new Date();

            if (response && response.status) {
                switch (response.status) {
                    case 'INITIAL_LOAD':
                    case 'UPDATED':
                        ChatroomUIModule.displayMessages(response.messages);
                        break;
                    case 'ALL_DELETED':
                        console.log('All messages have been deleted.');
                        ChatroomUIModule.clearMessages();
                        break;
                    case 'NO_CHANGE':
                        break;
                    default:
                        console.error('Unknown status from server:', response.status);
                }
            } else if (response.error) {
                console.error('Error from server:', response.error);
            } else {
                console.log('Unexpected response format:', response);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    /***
     This function is responsible for checking if there's an existing session
     ***/
    // const checkSession = async function (msgId) {
    //     try {
    //         const response = await fetch('/check-session', {
    //             method: 'POST',
    //             headers: {'Content-Type': 'application/json'},
    //             body: JSON.stringify({msgId})
    //         });
    //
    //         // Validate the response status
    //         const validateResponse = await ChatroomAPI.status(response);
    //
    //         // Parse the response and check if the session is authenticated
    //         const session = await response.json();
    //         return session.authenticated;
    //     }
    //     catch (error) {
    //         console.error('Error checking session:', error);
    //         return false;
    //     }
    //
    // }

    const handleEdit = async function (msgId, msg){

        try {
            await ChatroomAPI.fetchCheckSession();
            ChatroomUIModule.editMsg(msgId,msg);
        }
        catch (error) {
            console.log(error);
        }
    };

    const handleCancel = async function (){

        try {
               await ChatroomAPI.fetchCheckSession();
               ChatroomUIModule.cancelMsg();
        }
        catch (error) {
            console.log(error);
        }
    };

    const handleSave = async function(msgId, newInput) {
        try {
            const result = await ChatroomAPI.fetchSave(msgId, newInput);
            return result.updated;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    // const handleSave = async function (msgId, newInput){
    //     try {
    //         if (await checkSession(msgId)) {
    //             // means the session is valid
    //
    //             // fetch that finds the message and changes it's content
    //             const response = await fetch('/save-msg', {
    //                 method: 'POST',
    //                 headers: {'Content-Type': 'application/json'},
    //                 body: JSON.stringify({msgId, newInput})
    //             });
    //
    //             const validateResponse = await ChatroomAPI.status(response);
    //             const message = await response.json();
    //
    //             if (message.updated) {
    //                 // in order to show the updated message
    //                 ChatroomUIModule.saveMsg(msgId, newInput);
    //             }
    //             else {
    //                 console.log("Failed to update the message");
    //             }
    //         }
    //         else {
    //             // If no session, redirect to login
    //             window.location.href = '/login';
    //         }
    //     }
    //     catch (error) {
    //         console.log(error);
    //     }
    // }

    // const handleCancel = async function (msgId, editedInput, originalInput){
    //     try {
    //         if (await checkSession(msgId)) {
    //             ChatroomUIModule.cancelMsg(msgId, editedInput, originalInput);
    //         }
    //         else {
    //             // no session, redirect to login
    //             window.location.href = '/login';
    //         }
    //     }
    //     catch (error) {
    //         console.log(error);
    //     }
    // }

    const handleDelete = async function (msgId){

        console.log(`Handling delete for message ID: ${msgId}`);
        try {

            const message = await ChatroomAPI.fetchDelete(msgId);

            if (message.deleted) {
                console.log("Message successfully deleted");
                fetchAndDisplayMessages().catch(error => {console.log(error)});
            }
            else {
                console.log("Failed to delete the message");
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

    const fetchMessages = async function (lastUpdate) {
        try {
            const response = await fetch('/api/existingMessages', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({lastUpdate})
            });

            const validResponse = await status(response);
            return await response.json();
        }
        catch (error) {
            console.log(`Error fetching messages from database: ${error}`);
        }
    };

    const fetchDelete = async function (msgId) {
        try {
            // find and delete message from database
            const response = await fetch('/api/find-and-delete-msg', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({msgId})
            });

            const validResponse = await status(response);
            return await response.json();
        }
        catch (error) {
            console.log(`Error fetching delete from database: ${error}`);
        }
    };

    // const fetchSave = async function (msgId,newInput) {
    //     try {
    //         // fetch that finds the message and changes it's content
    //         const response = await fetch('/save-msg', {
    //             method: 'POST',
    //             headers: {'Content-Type': 'application/json'},
    //             body: JSON.stringify({msgId, newInput})
    //         });
    //
    //         const validateResponse = await status(response);
    //         const message = await response.json();
    //     }
    //     catch (error) {
    //         console.log(`Error fetching save from database: ${error}`);
    //     }
    //
    // };

    const fetchSave = async function (msgId, newInput) {
        try {
            const response = await fetch('/api/save-msg', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({msgId, newInput})
            });

            const validateResponse = await status(response);
            return await response.json();
        }
        catch (error) {
            console.log(`Error fetching save from database: ${error}`);
            throw error;  // Propagate the error
        }
    };

    // const fetchCheckSession = async function () {
    //     try {
    //         const response = await fetch('/api/check-session');
    //         const validResponse = await status(response);
    //         return validResponse.json();
    //     }
    //     catch (error) {
    //         console.log(`Error checking session: ${error}`);
    //         throw error;
    //     }
    // };
    const fetchCheckSession = async function () {
        try {
            const response = await fetch('/api'); // Calls the new GET /api route
            const validResponse = await status(response);
            return validResponse.json();
        } catch (error) {
            console.error(`Error checking session: ${error.message}`);
            throw error;
        }
    };


    function status(response) {

        if (response.status >= 200 && response.status < 300) {
            return response
        }
        else if (response.status === 400){ // for input validation failure, bad request
            window.location.href = '/chatroom';
        }
        else if (response.status >= 401) {  // the session is expired
            window.location.href = '/login';
        }
        else
        {
            window.location.href = '/error';
            return Promise.reject(new Error("Couldn't find any response"));
        }
    }


    return {
        fetchMessages,
        fetchDelete,
        fetchSave,
        fetchCheckSession,
        status
    }

})();

const ChatroomUIModule = (function() {

    let currentEditingMsgId = null; // To keep track of the message being edited

    // Function to display messages in the chat area
    const displayMessages = function (messages) {

        const chatMessagesDiv = document.getElementById('chatMessages');

        // Clear existing messages
        chatMessagesDiv.innerHTML = '';

        // Loop through each message and create a Bootstrap card for it
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('d-flex', 'mb-3');
            messageDiv.classList.add(msg.isOwnedByUser ? 'justify-content-end' : 'justify-content-start');

            messageDiv.innerHTML = `
                <div class="message-wrapper ${msg.isOwnedByUser ? 'ms-auto' : 'me-auto'}" style="max-width: 85%; min-width: 300px;">
                    <div class="card border-0 shadow-sm ${msg.isOwnedByUser ? 'bg-primary bg-opacity-60' : 'bg-light'}">
                        <div class="card-body position-relative p-2" style="min-height: 100px;">
                            <div class="d-flex justify-content-between align-items-center mb-1" style="min-width: 200px;">
                                <span class="small ${msg.isOwnedByUser ? 'text-white' : 'text-muted'}">${msg.username}</span>
                                <small class="${msg.isOwnedByUser ? 'text-white' : 'text-muted'}">
                                    ${new Intl.DateTimeFormat('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    }).format(new Date(msg.timestamp))}
                                </small>
                            </div>
                            <p class="mb-4 ${msg.isOwnedByUser ? 'text-white' : ''}">${msg.message}</p>
                            ${msg.isOwnedByUser ? `
                                <div class="position-absolute bottom-0 end-0 m-2">
                                    <button class="btn btn-light btn-sm edit-button" data-message-id="${msg.id}">
                                        Edit
                                    </button>
                                    <button class="btn btn-danger btn-sm delete-button" data-message-id="${msg.id}">
                                        Delete
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <small class="text-muted d-block mt-1">
                        ${new Intl.DateTimeFormat('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    }).format(new Date(msg.timestamp))}
                    </small>
                </div>
            `;

            chatMessagesDiv.appendChild(messageDiv);

            const editButton = messageDiv.querySelector('.edit-button');
            if (editButton) {
                editButton.addEventListener('click', () => Manager.handleEdit(msg.id, msg.message));
            }

            const deleteButton = messageDiv.querySelector('.delete-button');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => Manager.handleDelete(msg.id));
            }
        });

    };

    // const editMsg  = function (msgId) {
    //
    //     // Find the message card using the msgId
    //     const messageElement = document.querySelector(`[data-message-id="${msgId}"]`).closest('.card-body');
    //
    //     if (!messageElement) {
    //         console.error('Message element not found for ID:', msgId);
    //         return;
    //     }
    //
    //     // Get the current message text
    //     const messageTextElement = messageElement.querySelector('.card-text');
    //     const currentMessageText = messageTextElement.textContent;
    //
    //     // Create a text input for editing the message
    //     const editInput = document.createElement('input');
    //     editInput.type = 'text';
    //     editInput.classList.add('form-control', 'mb-2'); // Add Bootstrap styles
    //     editInput.value = currentMessageText; // Pre-fill with the current message
    //     editInput.required = true; // Make the input required
    //
    //
    //     // Replace the message text with the input field
    //     messageTextElement.replaceWith(editInput);
    //
    //     // Get the edit button and change it to a save button
    //     const editButton = messageElement.querySelector(`.edit-button[data-message-id="${msgId}"]`);
    //     editButton.textContent = 'Save';
    //     editButton.classList.remove('btn-warning');
    //     editButton.classList.add('btn-success');
    //
    //     // Change the delete button to a cancel button
    //     const deleteButton = messageElement.querySelector(`.delete-button[data-message-id="${msgId}"]`);
    //     deleteButton.textContent = 'Cancel';
    //     deleteButton.classList.remove('btn-danger');
    //     deleteButton.classList.add('btn-secondary');
    //
    //     // Remove the current listeners and add new ones
    //     deleteButton.removeEventListener('click', Manager.handleDelete); // Remove delete behavior
    //     deleteButton.addEventListener('click', () => Manager.handleCancel(msgId, editInput, currentMessageText)); // Add cancel behavior
    //
    //     // Remove the edit button listener and add a save listener
    //     editButton.removeEventListener('click', Manager.handleEdit);
    //     editButton.addEventListener('click', () => Manager.handleSave(msgId, editInput));
    // };

    const editMsg = function (msgId, currentMessageText) {

        currentEditingMsgId = msgId; // Track the message being edited
        const modalInput = document.getElementById('editMessageInput');
        modalInput.value = currentMessageText; // Pre-fill the modal with the current message

        // Show the modal using Bootstrap
        openModal();
    };

    const cancelMsg = function () {
        closeModal();
        currentEditingMsgId = null;
        console.log('Edit cancelled for message ID:', currentEditingMsgId);
    };

    const saveMsg = async function () {

        const form = document.getElementById('editMessageForm');
        const modalInput = document.getElementById('editMessageInput');
        const newMessageText = modalInput.value.trim();

        // Trigger HTML form validation
        if (!form.checkValidity()) {
            // This will trigger the HTML5 validation message if the input is empty
            modalInput.reportValidity(); // Show the browser's validation message
            return; // Stop the function execution
        }

        try {
            // Call the Manager's save handler
            const success = await Manager.handleSave(currentEditingMsgId, newMessageText);

            if (success) {
                // Update UI only after successful save
                updateMessageInUI(currentEditingMsgId, newMessageText);
                closeModal();
                currentEditingMsgId = null;
            } else {
                showError('Failed to save message');
            }
        } catch (error) {
            showError('Error saving message');
            console.error(error);
        }
    };

    const updateMessageInUI = function(messageId, newText) {
        const messageElement = document.querySelector(`.card-text[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.textContent = newText;
        }
    };

    // Private UI helper functions
    const openModal = function() {
        const modal = new bootstrap.Modal(document.getElementById('editMessageModal'));
        modal.show();
    };

    const closeModal = function() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('editMessageModal'));
        if (modal) {
            modal.hide();
        }
    };

    const clearMessages = function () {
        const chatMessagesDiv = document.getElementById('chatMessages');
        chatMessagesDiv.innerHTML = '';
    };


    return {
        displayMessages,
        editMsg,
        cancelMsg,
        saveMsg,
        clearMessages
    };

})();

})();