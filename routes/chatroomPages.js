
const express = require('express');
const router = express.Router();
const {checkIfSessionExists} = require('../models/authorisation');
const chatroomPagesController = require('../controllers/chatroomPages');

router.all('/', checkIfSessionExists);

router.get('/search', chatroomPagesController.getSearchPage);

router.post('/sendMessage', chatroomPagesController.sendMessage);

router.post('/findMessages', chatroomPagesController.postFindMessages);

router.get('/findMessages',chatroomPagesController.getFindMessages);

module.exports = router;