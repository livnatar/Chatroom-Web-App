
const express = require('express');
const router = express.Router();

const chatroomController = require('../controllers/chatroom');

router.get('/',chatroomController.getChatroom)

router.get('/chatroom', chatroomController.getChatroom);

router.post('/chatroom', chatroomController.postChatroom);

router.get('/chatroom/search', chatroomController.getSearchPage);

router.post('/sendMessage', chatroomController.sendMessage);

router.get('/logout', chatroomController.logout);

router.post('/chatroom/findMessages', chatroomController.postFindMessages);

router.get('/chatroom/findMessages',chatroomController.getFindMessages);

module.exports = router;