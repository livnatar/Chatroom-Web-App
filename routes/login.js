
const express = require('express');
const router = express.Router();
const loginLogoutController = require('../controllers/loginLogout');
const {isNotLoggedIn} = require('../models/authorisation');


router.all('/login', isNotLoggedIn);

router.get('/login', loginLogoutController.getLogin);

router.post('/login',loginLogoutController.getLogin);

router.get('/logout', loginLogoutController.logout);


// router.get('/chatroom', loginController.getChatroom);
//
// router.post('/chatroom', loginController.postChatroom);

module.exports = router;
