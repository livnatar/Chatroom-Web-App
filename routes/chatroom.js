
const express = require('express');
const router = express.Router();

const chatroomController = require('../controllers/chatroom');

router.get('/',chatroomController.getChatroom)

router.get('/chatroom', chatroomController.getChatroom);

router.post('/chatroom', chatroomController.postChatroom);

router.get('/logout', chatroomController.logout);

module.exports = router;