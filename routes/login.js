
var express = require('express');
var router = express.Router();
const loginController = require('../controllers/login');

router.get('/', loginController.getLogin);

router.get('/chatroom', loginController.getChatroom);

router.post('/chatroom', loginController.postChatroom);

module.exports = router;
