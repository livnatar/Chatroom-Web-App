
var express = require('express');
var router = express.Router();
const loginController = require('../controllers/login');

// router.all(/login, redirectToChat);
// we have it in the apps the isNotLoggedIn func


router.get('/login', loginController.getLogin);

router.post('/login',loginController.getLogin);

// router.get('/chatroom', loginController.getChatroom);
//
// router.post('/chatroom', loginController.postChatroom);

module.exports = router;
