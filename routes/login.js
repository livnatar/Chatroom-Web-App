
const express = require('express');
const router = express.Router();
const loginLogoutController = require('../controllers/loginLogout');
const {isNotLoggedIn} = require('../models/authorisation');

// Middleware to check if the user is not logged in
router.all('/login', isNotLoggedIn);

// Handle GET request for login page
router.get('/login', loginLogoutController.getLogin);

// Handle POST request for login page
router.post('/login',loginLogoutController.getLogin);

// Handle GET request for logout page
router.get('/logout', loginLogoutController.logout);

module.exports = router;
