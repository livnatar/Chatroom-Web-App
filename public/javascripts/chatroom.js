

(function() {

    const POLLING = 10000;
    let lastUpdate = null;

    document.addEventListener('DOMContentLoaded', function () {

        //fetch messages from database if there are any
        ManagerModule.fetchAndDisplayMessages().catch(error => {console.log(error)});

        // Event listener for the Save and Close buttons in the modal
        document.getElementById('saveEditButton').addEventListener('click', ManagerModule.initiateMessageSave);
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

        const spinner = document.querySelector("#loadingSpinner");

        /**
         * Fetches messages from the server based on the last update timestamp and updates the UI.
         *
         * This function handles the following server response statuses:
         * - `INITIAL_LOAD`: all messages are displayed in the UI.
         * - `UPDATED`: all messages are displayed in the UI.
         * - `ALL_DELETED`: Clears all messages from the UI.
         * - `NO_CHANGE`: No updates to messages, so no changes are made.
         *
         * If an error occurs during fetching or UI updates, it is caught and an error message is shown.
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
                ChatroomUIModule.showError(error.message || error);
            }
        };

        /**
         * Handles the editing of a message in the chatroom UI.
         * This function triggers the edit process for the specified message.
         *
         * @param msgId
         * @param msg
         */
        const handleEdit = function(msgId, msg){
            ChatroomUIModule.editMsg(msgId, msg);
        };

        /**
         * Cancels the message editing process in the chatroom UI.
         * This function triggers the cancel operation, reverting any changes made to the message.
         */
        const handleCancel = function(){
           ChatroomUIModule.cancelMsg();
        };

        /**
         * Initiates the process of saving an edited message in the chatroom.
         *
         * This function retrieves the message data from the UI, triggers the save operation via an API call,
         * and updates the UI accordingly if the message is successfully updated.
         * It also handles errors and manages the visibility of a loading spinner during the process.
         *
         * @returns {Promise<void>}
         */
        const initiateMessageSave = async function() {

            // Get message data from the UI Module
            const messageData = ChatroomUIModule.getEditingMessageData();
            if (!messageData) {
                return;
            }

            // setting the spinner
            spinner.classList.remove("d-none");

            try {
                // Call API with the data
                const result = await ChatroomAPIModule.fetchSave(messageData.currentEditingMsgId, messageData.newText);

                // if the message has been updated, call UI Module to update the message
                if (result.updated) {
                    ChatroomUIModule.updateMessageInUI(messageData.currentEditingMsgId, messageData.newText);
                    ChatroomUIModule.closeEditModal();
                    ChatroomUIModule.clearEditingState();
                }
            }
            catch (error) {
                ChatroomUIModule.showError(error.message||error);
            }
            finally {
                // turn off spinner
                spinner.classList.add("d-none");
            }
        };

        /**
         * Handles sending a new message in the chatroom.
         *
         * This function retrieves the message content from the UI, sends it to the server via an API call,
         * and updates the UI if the message is successfully added to the database.
         * If the message is successfully added, it appends the new message to the chat and clears the input field.
         *
         * @returns {Promise<void>}
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
                ChatroomUIModule.showError(error.message || error);
            }
        };

        /**
         * Handles the deletion of a message in the chatroom.
         *
         * This function sends a request to the server to delete the specified message and updates the UI
         * to reflect the deletion if successful. It also manages the visibility of a loading spinner
         * during the process and handles any errors that occur.
         *
         * @param msgId
         * @returns {Promise<void>}
         */
        const handleDelete = async function (msgId){

            spinner.classList.remove("d-none");
            try {
                const message = await ChatroomAPIModule.fetchDelete(msgId);

                // If message has been successfully deleted from database call UI to delete it from DOM
                if (message.deleted) {
                    ChatroomUIModule.deleteMsg(msgId);
                }
            }
            catch (error) {
                ChatroomUIModule.showError(error.message || error);
            }
            finally {
                // turn off spinner
                spinner.classList.add("d-none");
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
     * The module validates the server response, handles errors, and takes appropriate actions based on the status code.
     *
     * @type {{
     *   fetchNewMessage: (function(string): Promise<*>),
     *   fetchDelete: (function(string): Promise<*>),
     *   fetchMessages: (function((Date|string)): Promise<*>),
     *   fetchSave: (function(string, string): Promise<*>),
     *   status: ((function(Response): (Promise<never>|*))|*)}}
     */
    const ChatroomAPIModule = (function() {

        /**
         * This function handles the process of sending a new message to the server.
         * It sends a POST request to the server with the message content, and if the request is successful,
         * the server responds with the message status. The function processes the server's response
         * and returns the result.
         *
         * @param {string} message - The message content to be sent.
         * @returns {Promise<Object>} - A promise resolving to the server response containing message status.
         */
        const fetchNewMessage = async function(message) {
            const response = await fetch("/api/send-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            const validResponse = await status(response);
            return await validResponse.json();
        };

        /**
         * Fetches messages from the server based on the timestamp of the last update.
         * This function sends a POST request to the server with the provided timestamp,
         * requesting messages that have been added or updated since the specified timestamp.
         *
         * @param {Date|string} lastUpdate - The timestamp of the last known update to check for changes.
         * @returns {Promise<Object>} - A promise resolving to the server response containing message data.
         */
        const fetchMessages = async function (lastUpdate) {
            const response = await fetch('/api/existing-messages', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({lastUpdate})
            });

            const validResponse = await status(response);
            return await validResponse.json();
        };

        /**
         * Sends a request to delete a specific message from the database based on its unique identifier.
         * This function performs a DELETE request to the server, passing the message ID, and handles the server's response.
         *
         * If the deletion is successful, the server responds with a success status. If the deletion fails, the response
         * will contain an error message or failure status.
         *
         * @param {string} msgId - The unique identifier of the message to delete.
         * @returns {Promise<Object>} - A promise resolving to the server response indicating success or failure.
         */
        const fetchDelete = async function (msgId) {
            const response = await fetch('/api/find-and-delete-msg', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({msgId})
            });

            const validResponse = await status(response);
            return await validResponse.json();
        };

        /**
         * Sends a request to save a new input for a specific message, updating the message's content.
         * This function performs a PUT request to the server, passing the message ID and the new input.
         * The server processes the update and responds with a status indicating success or failure.
         *
         * @param {string} msgId - The unique identifier of the message.
         * @param {string} newInput - The new input to save for the message.
         * @returns {Promise<Object>} - A promise resolving to the server response.
         */
        const fetchSave = async function (msgId, newInput) {
            const response = await fetch('/api/save-msg', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({msgId, newInput})
            });

            const validateResponse = await status(response);
            return await validateResponse.json();
        };

        /**
         * Handles the response status of a fetch request and takes appropriate actions based on the status code.
         *
         * This function checks the status code of the fetch response:
         * - If the status code is between 200 and 299 (inclusive), it returns the response.
         * - If the status code indicates a client-side error (400 or 405), it rejects the promise and provides the error response.
         * - If the status code indicates an authorization issue (401), it redirects to the login page.
         * - For all other status codes, it redirects to a generic error page.
         *
         * @param {Response} response - The fetch response to be validated.
         * @returns {Promise<never>|*} - Returns the response if status is valid; otherwise, redirects and rejects.
         */
        async function status(response) {
            if (response.status >= 200 && response.status < 300) {
                return response
            }
            else if (response.status === 400 || response.status === 405 ){ // for input validation failure, bad request // Method Not Allowed
                return Promise.reject(await response.json());
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
            status
        }
    })();

    /**
     * The `ChatroomUIModule` module provides functions for interacting with the user interface of the chatroom.
     * It handles operations such as displaying, editing, deleting, and saving messages, along with managing the message input state.
     * The module also opens and closes modals for editing messages and validates the message content before processing.
     *
     * @type {{
     *   editMsg
     *   cancelMsg
     *   deleteMsg
     *   closeEditModal
     *   getMessageContent: ((function(): (string|null))|*),
     *   clearMessages
     *   getEditingMessageData: ((function(): ({currentEditingMsgId: null, newText: string}|null))|*),
     *   showError
     *   displayMessages
     *   updateMessageInUI
     *   appendNewMessage
     *   clearMsgBox
     *   clearEditingState}}
     */
    const ChatroomUIModule = (function() {

        let currentEditingMsgId = null; // To keep track of the message being edited
        let messageInput = document.getElementById("message");
        let chatMessagesDiv = document.getElementById('chatMessages');
        let modalInput = document.getElementById('editMessageInput');
        const editModal = new bootstrap.Modal(document.getElementById('editMessageModal'));
        const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
        let modalErrorInput = document.getElementById('errorText');


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
                    await ManagerModule.handleEdit(messageId, message);
                }
                if (target.classList.contains('delete-button')) {
                    await ManagerModule.handleDelete(messageId);
                }
            }
            catch (error) {
                console.error('Error handling message action:', error);
                ChatroomUIModule.showError('Something went wrong! Please try again later.');
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
            openModal(editModal);
        };

        /**
         * This function cancels the message editing process by closing the modal and resetting
         * the tracking of the currently edited message.
         */
        const cancelMsg = function () {
            closeModal(editModal);
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
         * This function opens a modal, either for editing or error.
         *
         * @param modal
         */
        const openModal = function(modal) {
            modal.show();
        };

        /**
         * Closes the edit modal.
         * This function calls another function to close the modal associated with editing a message.
         */
        const closeEditModal  = function(){
           closeModal(editModal);
        };

        /**
         * Closes the specified modal.
         * This function hides the given modal by calling the `hide` method on it.
         *
         *
         * @param modal
         */
        const closeModal = function(modal) {
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

        /**
         * Displays an error message in a modal.
         * This function closes the current modal, updates the error modal with the provided message,
         * and opens the error modal to display the message to the user.
         *
         * @param errorMsg
         */
        const showError = function(errorMsg){
            closeModal(editModal);
            modalErrorInput.innerHTML = errorMsg;
            openModal(errorModal);
        };

        return {
            displayMessages,
            editMsg,
            cancelMsg,
            clearMessages,
            deleteMsg,
            getEditingMessageData,
            closeEditModal,
            updateMessageInUI,
            clearEditingState,
            appendNewMessage,
            getMessageContent,
            clearMsgBox,
            showError
        };
    })();

})();
