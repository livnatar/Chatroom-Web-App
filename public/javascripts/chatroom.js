
// ----------------------------------- consts ----------------------------------
const POLLING = 10000*600 ;

//---------------------------------- functions ---------------------------------

(function() {

    let lastUpdate = null;

    document.addEventListener('DOMContentLoaded', function () {

        //fetch messages from database if there are any
        ManagerModule.fetchAndDisplayMessages().catch(error => {console.log(error)});

        // Event listener for the Save button in the modal
        document.getElementById('saveEditButton').addEventListener('click', ManagerModule.initiateMessageSave);

        // Event listener for when the modal is closed
        document.getElementById('editMessageModal').addEventListener('hidden.bs.modal', ManagerModule.handleCancel); // Handles modal close

        // Event listener for the Send button responsible for sending messages
        document.getElementById('sendMessageBtn').addEventListener('click', ManagerModule.handleSendNewMessage);

        // display messages every 10 seconds
        setInterval(ManagerModule.fetchAndDisplayMessages, POLLING);

    });

    /**
     * The `ManagerModule` module provides functions for handling message-related operations such as sending, editing, deleting, and fetching messages.
     * It interacts with the `ChatroomAPI` to perform actions on the server, and with the `ChatroomUIModule` to update the user interface accordingly.
     *
     * @type {{
     *   handleSendNewMessage: ((function(): Promise<void>)|*),
     *   fetchAndDisplayMessages: ((function(): Promise<void>)|*),
     *   handleCancel: ((function(): Promise<void>)|*),
     *   initiateMessageSave: ((function(): Promise<void>)|*),
     *   handleEdit: ((function(string, string): Promise<void>)|*),
     *   handleDelete: ((function(string): Promise<void>)|*)
     * }}
     */
    const ManagerModule = (function (){

        /**
         * This function fetches and displays messages from the server. It handles different response statuses
         * and updates the UI accordingly. It also logs any errors or unexpected response formats.
         *
         * @returns {Promise<void>} - A promise that resolves when the function completes its execution.
         */
        const fetchAndDisplayMessages = async function() {
            try {
                const response = await ChatroomAPIModule.fetchMessages(lastUpdate);
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
                }
            }
            catch (error) {
                console.error('Error fetching messages from server:', error.message || error);
                window.location.href = '/error';
            }
        };

        /**
         * This function handles the editing of a message. It first checks the session with the server,
         * then calls the UI module to initiate the editing process.
         *
         * @param {string} msgId - The ID of the message to edit.
         * @param {string} msg - The content of the message to edit.
         * @returns {Promise<void>} - A promise that resolves when the function completes its execution.
         */
        const handleEdit = async function(msgId, msg){
            try {
                const message = await ChatroomAPIModule.fetchEdit(msgId);
                if (message.edited) {
                    ChatroomUIModule.editMsg(msgId, msg);
                }
            }
            catch (error) {
                console.error(`Error editing message (ID: ${msgId}): "${msg}"`, error.message || error);
                window.location.href = '/error';
            }
        };

        /**
         * This function handles the cancellation of message editing. It first checks the session with the server,
         * then calls the UI module to cancel the message editing process.
         *
         * @returns {Promise<void>} - A promise that resolves when the function completes its execution.
         */
        const handleCancel = async function(){
            try {
                   await ChatroomAPIModule.fetchCheckSession();
                   ChatroomUIModule.cancelMsg();
            }
            catch (error) {
                console.error("Error canceling message editing: Session check failed.", error.message || error);
                window.location.href = '/error';
            }
        };

        /**
         * This function initiates the process of saving a message after editing. It retrieves the message data from the UI module,
         * then calls the API to save the changes. If the update is successful, it updates the message in the UI and clears the editing state.
         *
         * @returns {Promise<void>} - A promise that resolves when the function completes its execution.
         */
        const initiateMessageSave = async function() {

            // Get message data from the UI Module
            const messageData = ChatroomUIModule.getEditingMessageData();
            if (!messageData) {
                return;
            }

            try {
                // Call API with the data
                const result = await ChatroomAPIModule.fetchSave(messageData.currentEditingMsgId, messageData.newText);

                // if the message has been updated, call UI Module to update the message
                if (result.updated) {
                    ChatroomUIModule.updateMessageInUI(messageData.currentEditingMsgId, messageData.newText);
                    ChatroomUIModule.closeModal();
                    ChatroomUIModule.clearEditingState();
                }
            }
            catch (error) {
                console.error(`Error saving message (ID: ${messageData.currentEditingMsgId}): "${messageData.newText}"`,error.message || error);
                window.location.href = '/error';
            }
        };

        /**
         * This function handles the process of sending a new message. It retrieves the message content from the UI module,
         * then calls the API to send the message. If the message is successfully added, it appends the new message to the UI and clears the input field.
         *
         * @returns {Promise<void>} - A promise that resolves when the function completes its execution.
         */
        const handleSendNewMessage = async function(){

            // Get message data from the UI Module
            const message = ChatroomUIModule.getMessageContent();
            if (!message) {
                return;
            }

            try {
                // Call API with the data
                const result = await ChatroomAPIModule.fetchNewMessage(message);

                // If message has been added to database call UI to append the message
                if (result.added) {
                    ChatroomUIModule.appendNewMessage(result.message);

                    // Clear the input field
                    ChatroomUIModule.clearMsgBox();
                }
            }
            catch (error) {
                console.error(`Error sending message: "${message}"`, error.message || error);
                window.location.href = '/error';
            }
        };

        /**
         * This function handles the process of deleting a message. It sends a delete request to the API with the message ID,
         * and if the message is successfully deleted from the database, it removes the message from the DOM.
         *
         * @param {string} msgId - The ID of the message to delete.
         * @returns {Promise<void>} - A promise that resolves when the function completes its execution.
         */
        const handleDelete = async function (msgId){
            try {
                const message = await ChatroomAPIModule.fetchDelete(msgId);

                // If message has been successfully deleted from database call UI to delete it from DOM
                if (message.deleted) {
                    ChatroomUIModule.deleteMsg(msgId);
                }
            }
            catch (error) {
                console.error(`Error deleting message with ID ${msgId}:`, error.message || error);
                window.location.href = '/error';
            }
        }

        return {
            fetchAndDisplayMessages,
            handleEdit,
            handleDelete,
            handleCancel,
            initiateMessageSave,
            handleSendNewMessage
        }
})();

    /**
     * The `ChatroomAPIModule` module provides functions for interacting with the chatroom API.
     * It handles operations such as sending, fetching, deleting, saving messages, and checking the session status.
     * The module validates responses from the server and redirects based on different status codes.
     *
     * @type {{
     *   fetchNewMessage: ((function(string): Promise<Object>)|*),
     *   fetchMessages: ((function(Date|string): Promise<Object>)|*),
     *   fetchDelete: ((function(string): Promise<Object>)|*),
     *   fetchSave: ((function(string, string): Promise<Object>)|*),
     *   fetchCheckSession: ((function(): Promise<Object>)|*),
     *   status: ((function(Response): (Promise<never>|*))|*)
     * }}
     */
    const ChatroomAPIModule = (function() {

        /**
         * This function handles the process of sending a new message. It sends a request to the server with the message content.
         * If the request is successful, the server responds with the message status.
         *
         * @param {string} message - The message content to be sent.
         * @returns {Promise<Object>} - A promise resolving to the server response containing message status.
         */
        const fetchNewMessage = async function(message) {
            try {
                const response = await fetch("/api/send-message", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message }),
                });

                const validResponse = await status(response);
                return await validResponse.json();
            }
            catch (error) {
                console.error(`Error fetching messages from database: ${error}`);
                window.location.href = '/error';
            }
        };

        /**
         * Fetches messages from the server based on the last update timestamp.
         *
         * @param {Date|string} lastUpdate - The timestamp of the last known update to check for changes.
         * @returns {Promise<Object>} - A promise resolving to the server response containing message data.
         */
        const fetchMessages = async function (lastUpdate) {
            try {
                const response = await fetch('/api/existing-messages', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({lastUpdate})
                });

                const validResponse = await status(response);
                return await validResponse.json();
            }
            catch (error) {
                console.error(`Error fetching messages from database: ${error}`);
                window.location.href = '/error';
            }
        };

        /**
         * Sends a request to delete a specific message from the database.
         *
         * @param {string} msgId - The unique identifier of the message to delete.
         * @returns {Promise<Object>} - A promise resolving to the server response indicating success or failure.
         */
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
                console.error(`Error fetching delete from database: ${error}`);
                window.location.href = '/error';
            }
        };

        /**
         * Sends a request to save a new input for a specific message.
         *
         * @param {string} msgId - The unique identifier of the message.
         * @param {string} newInput - The new input to save for the message.
         * @returns {Promise<Object>} - A promise resolving to the server response.
         */
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
                console.error(`Error fetching save from database: ${error}`);
                window.location.href = '/error';
            }
        };

        /**
         * Fetches the data for editing a message by sending a request to the server.
         * It validates the server's response and returns the parsed JSON data.
         *
         * @param msgId - The ID of the message to fetch for editing.
         * @returns {Promise<*>} - A promise that resolves to the message data (JSON format).
         */
        const fetchEdit = async function (msgId) {
            try {
                const response = await fetch('/api/edit-message',{
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({msgId})
                });
                const validResponse = await status(response);
                return validResponse.json();
            }
            catch (error) {
                console.error(`Error checking session: ${error.message}`);
                window.location.href = '/error';
            }
        };

        /**
         * Checks the current session status by making a GET request to the /api endpoint.
         *
         * @returns {Promise<Object>} - A promise resolving to the server's response indicating session status.
         * @throws {Error} - Throws an error if the session check fails.
         */
        const fetchCheckSession = async function () {
            try {
                const response = await fetch('/api');
                const validResponse = await status(response);
                return validResponse.json();
            }
            catch (error) {
                console.error(`Error checking session: ${error.message}`);
                window.location.href = '/error';
            }
        };

        /**
         * Handles the response status and redirects based on the status code.
         *
         * @param {Response} response - The fetch response to be validated.
         * @returns {Promise<never>|*} - Returns the response if status is valid; otherwise, redirects and rejects.
         */
        function status(response) {

            if (response.status >= 200 && response.status < 300) {
                return response
            }
            else if (response.status === 400){ // for input validation failure, bad request
                window.location.href = '/chatroom';
            }
            else if (response.status === 401) {  // the session is expired
                window.location.href = '/login';
            }
            else
            {
                window.location.href = '/error';
            }
        }

        return {
            fetchNewMessage,
            fetchMessages,
            fetchDelete,
            fetchSave,
            fetchCheckSession,
            fetchEdit,
            status
        }
    })();

    /**
     * The `ChatroomUIModule` module provides functions for interacting with the user interface of the chatroom.
     * It handles operations such as displaying, editing, deleting, and saving messages, along with managing the message input state.
     * The module also opens and closes modals for editing messages and validates the message content before processing.
     *
     * @type {{
     *    editMsg,
     *    cancelMsg,
     *    getEditingMessageData: ((function(): ({currentEditingMsgId: null, newText: string}|null))|*),
     *    displayMessages,
     *    updateMessageInUI,
     *    appendNewMessage,
     *    deleteMsg,
     *    clearMsgBox,
     *    closeModal,
     *    clearEditingState,
     *    getMessageContent: ((function(): (string|null))|*),
     *    clearMessages}}
     */
    const ChatroomUIModule = (function() {

        let currentEditingMsgId = null; // To keep track of the message being edited
        let messageInput = document.getElementById("message");
        let chatMessagesDiv = document.getElementById('chatMessages');
        let modalInput = document.getElementById('editMessageInput');
        const modal = new bootstrap.Modal(document.getElementById('editMessageModal'));


        /**
         * Generates the HTML structure for a message in the chatroom.
         * The content and appearance of the message vary based on whether the message belongs to the user or another participant.
         *
         * @param msg
         * @returns {`
         <div class="d-flex mb-3 ${string}">
         <div class="message-wrapper ${string}" style="max-width: 85%; min-width: 300px;">
         <div class="card border-0 shadow-sm ${string}">
         <div class="card-body position-relative p-2" style="min-height: 100px;">
         <div class="d-flex justify-content-between align-items-center mb-1" style="min-width: 200px;">
         <span class="small ${string}">${*}</span>
         <small class="${string}">
         ${string}
         </small>
         </div>
         <p class="mb-4 ${string}">${string}</p>
         ${string|string}
         </div>
         </div>
         <small class="text-muted d-block mt-1">
         ${string}
         </small>
         </div>
         </div>
         `}
         */
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
                    <p class="mb-5 ${msg.isOwnedByUser ? 'text-white' : ''} text-break">${msg.message}</p>
                    ${msg.isOwnedByUser ? `
                        <div class="position-absolute bottom-0 end-0 m-2">
                            <button class="btn btn-light btn-sm edit-button" data-message-id="${msg.id}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-danger btn-sm delete-button" data-message-id="${msg.id}">
                                <i class="bi bi-trash"></i>
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

        /**
         * This function handles the event listener for actions on messages, such as editing and deleting.
         * It determines if the clicked element is an edit or delete button and triggers the appropriate action (edit or delete).
         *
         * @param event
         * @returns {Promise<void>}
         */
        const handleMessagesEventListener = async (event) => {
            const target = event.target.closest('.edit-button, .delete-button'); // Ensure it detects button clicks even if the icon is clicked
            if (!target) return; // Exit if not clicking an edit or delete button
            const messageId = target.dataset.messageId;

            try {
                if (target.classList.contains('edit-button')) {
                    const message = target.closest(".message-wrapper").querySelector('p').innerText;
                        //target.dataset.message;
                    await ManagerModule.handleEdit(messageId, message);
                }
                if (target.classList.contains('delete-button')) {
                    await ManagerModule.handleDelete(messageId);
                }
            } catch (error) {
                console.error('Error handling message action:', error);
                window.location.href = '/error';
            }
        };

        /**
         * This function displays the provided messages in the chatroom by rendering their HTML structure and appending them to the chat messages container.
         * It also adds an event listener to handle message actions like editing or deleting.
         *
         * @param messages
         */
        const displayMessages = function (messages) {
            chatMessagesDiv.innerHTML = messages.map(createMessageHTML).join('');
            chatMessagesDiv.addEventListener('click', handleMessagesEventListener);
        };

        /**
         * This function retrieves the message content from the input field, trims any leading or trailing spaces,
         * and validates that it is not empty. If the content is valid, it returns the message.
         * If the message is empty, it triggers the HTML input's `required` validity check and returns `null`.
         *
         * @returns {string|null}
         */
        const getMessageContent = function(){

            const message = messageInput.value.trim();
            if (!message) {
                // since message is empty, trigger HTML's require
                messageInput.reportValidity();
                return null;
            }
            return message;
        };

        /**
         * This function clears the message input field by setting its value to an empty string.
         * It effectively resets the message box, allowing the user to input a new message.
         */
        const clearMsgBox = function() {
            messageInput.value = '';
        };

        /**
         * This function appends a single new message to the chat messages container by creating
         * its HTML structure and appending it to the DOM.
         *
         * @param msg
         */
        const appendNewMessage = function(msg) {
            const messageHTML = createMessageHTML(msg);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = messageHTML;
            chatMessagesDiv.appendChild(tempDiv.lastElementChild);
        };

        /**
         * This function opens a modal to allow the user to edit an existing message. It pre-fills the modal input field
         * with the current content of the message.
         *
         * @param msgId
         * @param currentMessageText
         */
        const editMsg = function (msgId, currentMessageText) {
            currentEditingMsgId = msgId; // Track the message being edited
            modalInput.value = currentMessageText; // Pre-fill the modal with the current message

            // Show the modal using Bootstrap
            openModal();
        };

        /**
         * This function cancels the message editing process by closing the modal and resetting
         * the tracking of the currently edited message.
         */
        const cancelMsg = function () {
            closeModal();
            currentEditingMsgId = null;
        };

        /**
         * This function deletes a message from the chatroom by removing its HTML element
         * from the DOM based on the provided message ID.
         *
         * @param msgId
         */
        const deleteMsg = function (msgId) {

            const message = document.querySelector(`[data-message-id="${msgId}"]`);
            if (message) {
                const messageContainer = message.closest('.message-wrapper');
                if (messageContainer) {
                    messageContainer.remove(); // Directly removes the element
                }
            }
            else {
                console.log(`Message with ID ${msgId} not found.`);
            }
        }

        /**
         * This function retrieves the data for the message currently being edited.
         * It checks if the new text is valid and, if so, returns the ID of the message being edited along with the new text.
         *
         * @returns {{currentEditingMsgId: null, newText: string}|null}
         */
        const getEditingMessageData = function() {
            const newText = modalInput.value.trim();
            if (!newText) {
                modalInput.reportValidity();
                return null;
            }

            return {currentEditingMsgId, newText};
        };

        /**
         * This function updates the message text in the UI after it has been edited.
         * It finds the message based on its `messageId` (stored in the edit button's data attribute)
         * and replaces the message content with the new text.
         *
         * @param messageId
         * @param newText
         */
        const updateMessageInUI = function(messageId, newText) {

            // Find the edit button using the message ID stored in its data attribute
            const editButton = document.querySelector(`button.edit-button[data-message-id="${messageId}"]`);
            if (editButton) {
                // Go up to the card-body and find the message paragraph (p.mb-5)
                const cardBody = editButton.closest('.card-body');
                if (cardBody) {
                    const messageElement = cardBody.querySelector('p.mb-5');
                    if (messageElement) {
                        messageElement.textContent = newText;  // Update the message text in the UI
                    }
                }
            }
        };

        /**
         * This function opens the modal that allows the user to edit a message.
         * It uses Bootstrap's Modal component to display the modal by targeting the
         * modal element with the ID `editMessageModal`.
         */
        const openModal = function() {
            modal.show();
        };

        /**
         * This function closes the modal that is used for editing a message.
         * It uses Bootstrap's Modal component to hide the modal.
         */
        const closeModal = function() {
            modal.hide();
        };

        /**
         * This function clears all the messages displayed in the chatroom.
         * It removes all the HTML content inside the chat messages container.
         */
        const clearMessages = function () {
            chatMessagesDiv.innerHTML = '';
        };

        /**
         * This function clears the state of the message editing process.
         * It resets the editing input field and clears the tracking of the message being edited.
         */
        const clearEditingState = function() {
            modalInput.value = '';
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
            clearEditingState,
            appendNewMessage,
            getMessageContent,
            clearMsgBox
        };
    })();

})();
