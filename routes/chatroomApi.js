
const express = require('express');
const router = express.Router();

const {checkSession} = require('../models/authorisation');
const chatroomAPIController = require('../controllers/chatroomAPI');

//router.all('/', checkSession)
router.use(checkSession);

router.post('/existingMessages', chatroomAPIController.existingMessages);

router.post('/find-and-delete-msg', chatroomAPIController.findAndDeleteMsg );

router.post('/save-msg', chatroomAPIController.saveMsg );

module.exports = router;