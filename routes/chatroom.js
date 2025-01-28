
const express = require('express');
const router = express.Router();

const chatroomController = require('../controllers/chatroom');
const {checkIfSessionExists} = require('../models/authorisation');



router.get('/',checkIfSessionExists, chatroomController.getChatroom)

router.get('/chatroom', checkIfSessionExists, chatroomController.getChatroom);

router.post('/chatroom', chatroomController.postChatroom);


module.exports = router;