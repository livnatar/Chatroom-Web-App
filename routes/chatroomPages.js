
const express = require('express');
const router = express.Router();
const chatroomPagesController = require('../controllers/chatroomPages');
const { checkIfSessionExists } = require('../models/authorisation');

//router.all('/', checkIfSessionExists);
// Apply middleware to all routes in this router
router.use(checkIfSessionExists);

router.get('/search', chatroomPagesController.getSearchPage);

router.post('/sendMessage', chatroomPagesController.sendMessage);

router.post('/findMessages', chatroomPagesController.postFindMessages);

router.get('/findMessages',chatroomPagesController.getFindMessages);

module.exports = router;