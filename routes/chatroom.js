
const express = require('express');
const router = express.Router();
const chatroomController = require('../controllers/chatroom');
const {checkIfSessionExists} = require('../models/authorisation');


// Handle GET request to get the main chatroom page, checking if the session exists
router.get('/',checkIfSessionExists, chatroomController.getChatroom)
router.get('/chatroom', checkIfSessionExists, chatroomController.getChatroom);

// Handle POST request to post data to the chatroom
router.post('/chatroom', chatroomController.postChatroom);

module.exports = router;