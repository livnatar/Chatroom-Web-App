
const express = require('express');
const router = express.Router();
const {checkSession} = require('../models/authorisation');
const chatroomAPIController = require('../controllers/chatroomAPI');

// Middleware to check if session expired in order to know if we can stay in the chatroom
router.use(checkSession);

// Handle POST request to get existing messages in the chatroom
router.post('/existing-messages', chatroomAPIController.existingMessages);

// Handle POST request to find and delete a specific message in the chatroom
router.post('/find-and-delete-msg', chatroomAPIController.findAndDeleteMsg);

// Handle POST request to save a new message in the chatroom
router.post('/save-msg', chatroomAPIController.saveMsg);

// Handle POST request to send a new message in the chatroom
router.post('/send-message',chatroomAPIController.sendMsg);

// Handle POST request to edit a message in the chatroom
//router.post('/edit-message',chatroomAPIController.editMsg);


module.exports = router;