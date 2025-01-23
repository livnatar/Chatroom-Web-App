
var express = require('express');
var router = express.Router();
const loginController = require('../controllers/login');

router.get('/login', loginController.getLogin);

router.post('/login',loginController.getLogin);

// router.get('/chatroom', loginController.getChatroom);
//
// router.post('/chatroom', loginController.postChatroom);

module.exports = router;
