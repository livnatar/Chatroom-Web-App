
//import { ChatroomUIModule } from './chatroomUI.js';

// export const ChatroomUIModule = {
//
//     // Function to display messages in the chat area
//     displayMessages : function(messages) {
//
//         const chatMessagesDiv = document.getElementById('chatMessages');
//
//         // Clear existing messages
//         chatMessagesDiv.innerHTML = '';
//
//         // Loop through each message and create a Bootstrap card for it
//         messages.forEach(msg => {
//             const messageDiv = document.createElement('div');
//             messageDiv.classList.add('card', 'mb-3');  // Add Bootstrap card classes
//
//             messageDiv.innerHTML = `
//                 <div class="card-body">
//                     <h5 class="card-title">${msg.username}</h5>
//                     <p class="card-text">${msg.message}</p>
//                     <footer class="blockquote-footer">
//                         <small>
//                             ${new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(msg.createdAt))}
//                             -
//                             ${new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }).format(new Date(msg.createdAt))}
//                         </small>
//                     </footer>
//                     ${msg.isOwnedByUser ? `
//                         <button class="edit-button btn btn-warning" data-message-id="${msg.id}">Edit</button>
//                         <button class="delete-button btn btn-danger" data-message-id="${msg.id}">Delete</button>
//                     ` : ''}
//                 </div>
//             `;
//
//             chatMessagesDiv.appendChild(messageDiv);
//
//             // Event listener for Edit button
//             const editButton = messageDiv.querySelector('.edit-button');
//             if (editButton) {
//                 editButton.addEventListener('click', () => Manager.handleEdit(msg.id));
//             }
//
//             // Event listener for Delete button
//             const deleteButton = messageDiv.querySelector('.delete-button');
//             if (deleteButton) {
//                 deleteButton.addEventListener('click', () => Manager.handleDelete(msg.id));
//             }
//         });
//     },
//
//     editMsg : function (msgId) {
//
//         // Find the message card using the msgId
//         const messageElement = document.querySelector(`[data-message-id="${msgId}"]`).closest('.card-body');
//
//         if (!messageElement) {
//             console.error('Message element not found for ID:', msgId);
//             return;
//         }
//
//         // Get the current message text
//         const messageTextElement = messageElement.querySelector('.card-text');
//         const currentMessageText = messageTextElement.textContent;
//
//         // Create a text input for editing the message
//         const editInput = document.createElement('input');
//         editInput.type = 'text';
//         editInput.classList.add('form-control', 'mb-2'); // Add Bootstrap styles
//         editInput.value = currentMessageText; // Pre-fill with the current message
//         editInput.required = true; // Make the input required
//
//
//         // Replace the message text with the input field
//         messageTextElement.replaceWith(editInput);
//
//         // Get the edit button and change it to a save button
//         const editButton = messageElement.querySelector(`.edit-button[data-message-id="${msgId}"]`);
//         editButton.textContent = 'Save';
//         editButton.classList.remove('btn-warning');
//         editButton.classList.add('btn-success');
//
//         // Change the delete button to a cancel button
//         const deleteButton = messageElement.querySelector(`.delete-button[data-message-id="${msgId}"]`);
//         deleteButton.textContent = 'Cancel';
//         deleteButton.classList.remove('btn-danger');
//         deleteButton.classList.add('btn-secondary');
//
//         // Remove the current listeners and add new ones
//         deleteButton.removeEventListener('click', Manager.handleDelete); // Remove delete behavior
//         deleteButton.addEventListener('click', () => Manager.handleCancel(msgId, editInput, currentMessageText)); // Add cancel behavior
//
//         // Remove the edit button listener and add a save listener
//         editButton.removeEventListener('click', Manager.handleEdit);
//         editButton.addEventListener('click', () => Manager.handleSave(msgId, editInput));
//     },
//
//     cancelMsg : function (msgId, editInput, originalMessageText) {
//
//         // Restore the original message text
//         const messageElement = editInput.closest('.card-body');
//         const messageTextElement = document.createElement('p');
//         messageTextElement.classList.add('card-text');
//         messageTextElement.textContent = originalMessageText;
//         editInput.replaceWith(messageTextElement);
//
//         // Reset the buttons
//         const editButton = messageElement.querySelector(`.edit-button[data-message-id="${msgId}"]`);
//         editButton.textContent = 'Edit';
//         editButton.classList.remove('btn-success');
//         editButton.classList.add('btn-warning');
//         editButton.removeEventListener('click', manager.handleSave);
//         editButton.addEventListener('click', () => Manager.HandleEdit(msgId));
//
//         const deleteButton = messageElement.querySelector(`.delete-button[data-message-id="${msgId}"]`);
//         deleteButton.textContent = 'Delete';
//         deleteButton.classList.remove('btn-secondary');
//         deleteButton.classList.add('btn-danger');
//         deleteButton.removeEventListener('click', handleCancel);
//         deleteButton.addEventListener('click', () => handleDelete(msgId));
//     },
//
//     saveMsg : function (msgId, editInput) {
//
//         // Ensure the input field is required
//         editInput.required = true;
//
//         // Trigger validation by checking the validity of the input
//         if (!editInput.checkValidity()) {
//             editInput.reportValidity(); // Show browser's native validation message
//             return;
//         }
//
//         // Get the new message text
//         const newMessageText = editInput.value.trim();
//
//         // Replace the input field with the new message text
//         const newMessageElement = document.createElement('p');
//         newMessageElement.classList.add('card-text');
//         newMessageElement.textContent = newMessageText;
//         editInput.replaceWith(newMessageElement);
//
//         // Get the save button and change it back to an edit button
//         const saveButton = document.querySelector(`.edit-button[data-message-id="${msgId}"]`);
//         saveButton.textContent = 'Edit';
//         saveButton.classList.remove('btn-success');
//         saveButton.classList.add('btn-warning');
//
//         // Remove the current save listener and add an edit listener
//         saveButton.removeEventListener('click', Manager.handleSave);
//         saveButton.addEventListener('click', () => Manager.handleEdit(msgId));
//
//         // Get the "Cancel" button and change it back to "Delete"
//         const cancelButton = document.querySelector(`.delete-button[data-message-id="${msgId}"]`);
//         cancelButton.textContent = 'Delete';
//         cancelButton.classList.remove('btn-secondary');
//         cancelButton.classList.add('btn-danger');
//         cancelButton.removeEventListener('click', Manager.handleCancel);
//         cancelButton.addEventListener('click', () => Manager.handleDelete(msgId));
//
//         // Log the update to the console
//         console.log(`Message with ID ${msgId} updated to: "${newMessageText}"`);
//     }
//
//     //
//     //
//     // // Export the displayMessages function
//     // return {
//     //     displayMessages,
//     //     editMsg,
//     //     cancelMsg,
//     //     saveMsg,
//     //     displaySearchMessages
//     // };
// };
