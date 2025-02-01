
const express = require('express');
const router = express.Router();
const chatroomPagesController = require('../controllers/chatroomPages');
const { checkIfSessionExists } = require('../models/authorisation');

// Middleware to check if session expired in order to know if we can stay in the chatroom
router.use(checkIfSessionExists);

// Handle GET request for search page
router.get('/search', chatroomPagesController.getSearchPage);

// Handle POST request for find message in the search page
router.post('/findMessages', chatroomPagesController.postFindMessages);

module.exports = router;