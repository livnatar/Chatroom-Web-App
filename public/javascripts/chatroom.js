
//import { ChatroomUIModule } from './chatroomUI.js';

const POLLING = 10000 ;

(function() {
    let lastUpdate = null;

    document.addEventListener('DOMContentLoaded', function () {

        //fetch messages from database if there are any
        Manager.fetchAndDisplayMessages().catch(error => {console.log(error)});

        // Event listener for the Save button in the modal
        document.getElementById('saveEditButton').addEventListener('click', Manager.initiateMessageSave);
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

    const fetchAndDisplayMessages = async function() {
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

    const handleEdit = async function(msgId, msg){

        try {
            await ChatroomAPI.fetchCheckSession();
            ChatroomUIModule.editMsg(msgId,msg);
        }
        catch (error) {
            console.log(error);
        }
    };

    const handleCancel = async function(){

        try {
               await ChatroomAPI.fetchCheckSession();
               ChatroomUIModule.cancelMsg();
        }
        catch (error) {
            console.log(error);
        }
    };

    const initiateMessageSave = async function() {

        // Get message data from the UI Module
        const messageData = ChatroomUIModule.getEditingMessageData();
        if (!messageData) {
            return;
        }

        try {
            // Call API with the data
            const result = await ChatroomAPI.fetchSave(messageData.currentEditingMsgId, messageData.newText);

            // Update UI based on result
            if (result.updated) {
                ChatroomUIModule.updateMessageInUI(messageData.currentEditingMsgId, messageData.newText);
                ChatroomUIModule.closeModal();
                ChatroomUIModule.clearEditingState();
            }
        } catch (error) {
            console.error(error);
        }
    };
    // const handleSave = async function(msgId, newInput) {
    //     try {
    //         const result = await ChatroomAPI.fetchSave(msgId, newInput);
    //         return result.updated;
    //     } catch (error) {
    //         console.error(error);
    //         return false;
    //     }
    // };

    const handleDelete = async function (msgId){

        console.log(`Handling delete for message ID: ${msgId}`);
        try {

            const message = await ChatroomAPI.fetchDelete(msgId);

            if (message.deleted) {
                console.log("Message successfully deleted");
                ChatroomUIModule.deleteMsg(msgId);
                //fetchAndDisplayMessages().catch(error => {console.log(error)});
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
        initiateMessageSave
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
            return await validResponse.json();
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
            return await validResponse.json();
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
            return await validateResponse.json();
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

    // const displayMessages = function (messages) {
    //
    //     const chatMessagesDiv = document.getElementById('chatMessages');
    //
    //     // Clear existing messages
    //     chatMessagesDiv.innerHTML = '';
    //
    //     // Loop through each message and create a Bootstrap card for it
    //     messages.forEach(msg => {
    //         const messageDiv = document.createElement('div');
    //         messageDiv.classList.add('d-flex', 'mb-3');
    //         messageDiv.classList.add(msg.isOwnedByUser ? 'justify-content-end' : 'justify-content-start');
    //
    //         messageDiv.innerHTML = `
    //             <div class="message-wrapper ${msg.isOwnedByUser ? 'ms-auto' : 'me-auto'}" style="max-width: 85%; min-width: 300px;">
    //                 <div class="card border-0 shadow-sm ${msg.isOwnedByUser ? 'bg-primary bg-opacity-60' : 'bg-light'}">
    //                     <div class="card-body position-relative p-2" style="min-height: 100px;">
    //                         <div class="d-flex justify-content-between align-items-center mb-1" style="min-width: 200px;">
    //                             <span class="small ${msg.isOwnedByUser ? 'text-white' : 'text-muted'}">${msg.username}</span>
    //                             <small class="${msg.isOwnedByUser ? 'text-white' : 'text-muted'}">
    //                                 ${new Intl.DateTimeFormat('en-US', {
    //                     hour: 'numeric',
    //                     minute: 'numeric',
    //                     hour12: true
    //                 }).format(new Date(msg.timestamp))}
    //                             </small>
    //                         </div>
    //                         <p class="mb-4 ${msg.isOwnedByUser ? 'text-white' : ''}">${msg.message}</p>
    //                         ${msg.isOwnedByUser ? `
    //                             <div class="position-absolute bottom-0 end-0 m-2">
    //                                 <button class="btn btn-light btn-sm edit-button" data-message-id="${msg.id}">
    //                                     Edit
    //                                 </button>
    //                                 <button class="btn btn-danger btn-sm delete-button" data-message-id="${msg.id}">
    //                                     Delete
    //                                 </button>
    //                             </div>
    //                         ` : ''}
    //                     </div>
    //                 </div>
    //                 <small class="text-muted d-block mt-1">
    //                     ${new Intl.DateTimeFormat('en-US', {
    //                     weekday: 'short',
    //                     month: 'short',
    //                     day: 'numeric'
    //                 }).format(new Date(msg.timestamp))}
    //                 </small>
    //             </div>
    //         `;
    //
    //         chatMessagesDiv.appendChild(messageDiv);
    //
    //         const editButton = messageDiv.querySelector('.edit-button');
    //         if (editButton) {
    //             editButton.addEventListener('click', () => Manager.handleEdit(msg.id, msg.message));
    //         }
    //
    //         const deleteButton = messageDiv.querySelector('.delete-button');
    //         if (deleteButton) {
    //             deleteButton.addEventListener('click', () => Manager.handleDelete(msg.id));
    //         }
    //     });
    //
    // };

    // const displayMessages = function (messages) {
    //     const chatMessagesDiv = document.getElementById('chatMessages');
    //
    //     chatMessagesDiv.innerHTML = messages.map(msg => `
    //     <div class="d-flex mb-3 ${msg.isOwnedByUser ? 'justify-content-end' : 'justify-content-start'}">
    //         <div class="message-wrapper ${msg.isOwnedByUser ? 'ms-auto' : 'me-auto'}" style="max-width: 85%; min-width: 300px;">
    //             <div class="card border-0 shadow-sm ${msg.isOwnedByUser ? 'bg-primary bg-opacity-60' : 'bg-light'}">
    //                 <div class="card-body position-relative p-2" style="min-height: 100px;">
    //                     <div class="d-flex justify-content-between align-items-center mb-1" style="min-width: 200px;">
    //                         <span class="small ${msg.isOwnedByUser ? 'text-white' : 'text-muted'}">${msg.username}</span>
    //                         <small class="${msg.isOwnedByUser ? 'text-white' : 'text-muted'}">
    //                             ${new Intl.DateTimeFormat('en-US', {
    //         hour: 'numeric',
    //         minute: 'numeric',
    //         hour12: true
    //     }).format(new Date(msg.timestamp))}
    //                         </small>
    //                     </div>
    //                     <p class="mb-4 ${msg.isOwnedByUser ? 'text-white' : ''}">${msg.message}</p>
    //                     ${msg.isOwnedByUser ? `
    //                         <div class="position-absolute bottom-0 end-0 m-2">
    //                             <button class="btn btn-light btn-sm edit-button" data-message-id="${msg.id}" data-message="${msg.message}">
    //                                 Edit
    //                             </button>
    //                             <button class="btn btn-danger btn-sm delete-button" data-message-id="${msg.id}">
    //                                 Delete
    //                             </button>
    //                         </div>
    //                     ` : ''}
    //                 </div>
    //             </div>
    //             <small class="text-muted d-block mt-1">
    //                 ${new Intl.DateTimeFormat('en-US', {
    //         weekday: 'short',
    //         month: 'short',
    //         day: 'numeric'
    //     }).format(new Date(msg.timestamp))}
    //             </small>
    //         </div>
    //     </div>
    // `).join('');
    //
    //     chatMessagesDiv.addEventListener('click', async (event) => {
    //         const target = event.target;
    //         const messageId = target.dataset.messageId;
    //
    //         try {
    //             if (target.classList.contains('edit-button')) {
    //                 const message = target.dataset.message;
    //                 await Manager.handleEdit(messageId, message);
    //             }
    //             else if (target.classList.contains('delete-button')) {
    //                 await Manager.handleDelete(messageId);
    //             }
    //         } catch (error) {
    //             console.error('Error handling message action:', error);
    //         }
    //     });
    // };

    const createMessageHTML = (msg) => `
    <div class="d-flex mb-3 ${msg.isOwnedByUser ? 'justify-content-end' : 'justify-content-start'}">
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
                            <button class="btn btn-light btn-sm edit-button" data-message-id="${msg.id}" data-message="${msg.message}">
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
    </div>
`;

    const handleMessagesEventListener = async (event) => {
        const target = event.target;
        const messageId = target.dataset.messageId;

        try {
            if (target.classList.contains('edit-button')) {
                const message = target.dataset.message;
                await Manager.handleEdit(messageId, message);
            }
            else if (target.classList.contains('delete-button')) {
                await Manager.handleDelete(messageId);
            }
        } catch (error) {
            console.error('Error handling message action:', error);
        }
    };

    const displayMessages = function (messages) {
        const chatMessagesDiv = document.getElementById('chatMessages');
        chatMessagesDiv.innerHTML = messages.map(createMessageHTML).join('');
        chatMessagesDiv.addEventListener('click', handleMessagesEventListener);
    };

    // For when you need to append a single new message:
    const appendNewMessage = function(msg, chatMessagesDiv) {
        const messageHTML = createMessageHTML(msg);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = messageHTML;
        chatMessagesDiv.appendChild(tempDiv.firstElementChild);
    };

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
    };

    const deleteMsg = function (msgId) {

        const messageButton = document.querySelector(`[data-message-id="${msgId}"]`);

        if (messageButton) {
            const messageContainer = messageButton.closest('.message-wrapper');
            if (messageContainer) {
                messageContainer.remove(); // Directly removes the element
                console.log(`Message with ID ${msgId} removed.`);
            }
        }
        else {
            console.log(`Message with ID ${msgId} not found.`);
        }
    }

    const getEditingMessageData = function() {

        const modalInput = document.getElementById('editMessageInput');
        const newText = modalInput.value.trim();

        if (!newText) {
            modalInput.reportValidity();
            return null;
        }

        return {currentEditingMsgId, newText};
    };

    const updateMessageInUI = function(messageId, newText) {

        // Find the edit button first using the message ID
        const editButton = document.querySelector(`button.edit-button[data-message-id="${messageId}"]`);
        if (editButton) {
            // Go up to the card-body and find the message paragraph (p.mb-4)
            const cardBody = editButton.closest('.card-body');
            if (cardBody) {
                const messageElement = cardBody.querySelector('p.mb-4');
                if (messageElement) {
                    messageElement.textContent = newText;
                }
            }
        }
    };

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

    const clearEditingState = function() {
        document.getElementById('editMessageInput').value = '';
        currentEditingMsgId = null;
    };



    return {
        displayMessages,
        editMsg,
        cancelMsg,
        clearMessages,
        deleteMsg,
        getEditingMessageData,
        closeModal,
        updateMessageInUI,
        clearEditingState
    };

})();

})();