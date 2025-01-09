
var express = require('express');
var router = express.Router();


/* GET register page */
router.get('/', function(req, res, next) {
    res.render('register', { title: 'Chatroom Register' });
});


// Handle POST request when the user submits the registration form
router.post('/', function(req, res, next) {
    const { emailAddress, firstName, lastName } = req.body;

    // You can handle any validation or saving logic here if necessary

    // After registration is successful, redirect to create-password page
    res.redirect('/register/password');
});

// Handle GET request for the password creation page
router.get('/password', function(req, res, next) {
    res.render('createPassword', { title: 'Choose a Password' });
});


module.exports = router;
