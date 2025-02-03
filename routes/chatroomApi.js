
const express = require('express');
const router = express.Router();
const {checkSession} = require('../models/authorisation');
const chatroomAPIController = require('../controllers/chatroomAPI');

// Middleware to check if session expired in order to know if we can stay in the chatroom
router.use(checkSession);

// Handle POST request to get existing messages in the chatroom
router.post('/existing-messages', chatroomAPIController.existingMessages);

// Handle DELETE request to find and delete a specific message in the chatroom
router.delete('/find-and-delete-msg', chatroomAPIController.findAndDeleteMsg);

// Handle PUT request to save a new message in the chatroom
router.put('/save-msg', chatroomAPIController.saveMsg);

// Handle POST request to send a new message in the chatroom
router.post('/send-message',chatroomAPIController.sendMsg);

module.exports = router;