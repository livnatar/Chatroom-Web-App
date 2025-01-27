
var express = require('express');
var router = express.Router();
const {isNotLoggedIn} = require('../models/authorisation');
const registerController = require('../controllers/register');


router.all('/', isNotLoggedIn);

/* GET register page */
router.get('/', registerController.getRegister);

// Handle POST request when the user submits the registration form
router.post('/create-password', registerController.postCreatePassword);

// Handle GET request for the password creation page
router.get('/create-password',registerController.getCreatePassword );

// Handle POST request for password creation
router.post('/account-created', registerController.postAccountCreated);


router.get('/account-created', registerController.getAccountCreated);

module.exports = router;
