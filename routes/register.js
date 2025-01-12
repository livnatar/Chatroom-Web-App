
var express = require('express');
var router = express.Router();
//const User = require('../models/user');
const {User, findIfEmailExists, findUserByEmail, printList} = require("../models/user");


/* GET register page */
router.get('/', function(req, res, next) {
    res.render('register', {msg: ''});
});


// Handle POST request when the user submits the registration form
router.post('/', function (req, res, next) {
    const { emailAddress, firstName, lastName } = req.body;

    // add validation that relates to the funcs in models/validation.js

    if (findIfEmailExists(emailAddress)){
        res.render('register', {msg: 'Email already registered, try again'});
    }
    else {
        // Combine user data into a single object
        // const userData = JSON.stringify({ email: emailAddress, firstName, lastName });

        // Set the user data as a cookie (expires in 30 seconds)
        // res.cookie('userInfo', userData, { maxAge: 30000 });

        // add user to the list of users
        const user = new User(emailAddress);
        user.addUser();

        // Redirect to the password creation page
        res.redirect('/register/create-password');
    }
});


// Handle GET request for the password creation page
router.get('/create-password', function (req, res, next) {

    // Check if the userInfo cookie exists
    const userInfo = req.cookies.userInfo;
    if (!userInfo) {

        // add deletion from the userList
        // Redirect back to the register page if the cookie is missing or expired
        res.redirect('/register');
    }
    else {
        // Pass user data to the create-password view (to show email or other details)
        res.render('createPassword', {msg: '', userInfo: JSON.parse(userInfo)}); //for the validation later on
    }
});

// Handle POST request for password creation
router.post('/create-password', function (req, res, next) {

    const { password } = req.body;
    const userInfo = req.cookies.userInfo;

    if (!userInfo) {
        // If no user data is available (cookie expired or not found), redirect back to the register page
        res.redirect('/register');
    }
    else {
        // remember to check validation of password using models/validation.js

        // Get the user data from the cookie
        const { email } = JSON.parse(userInfo);

        // Find the user and add the password
        let user = findUserByEmail(email);
        user.addPassword(password);

        console.log('Password received:', password);

        // Clear the cookie after the user sets the password
        res.clearCookie('userInfo');

        printList();

        // Redirect to a success or login page
        res.redirect('/login-success');
    }

});


module.exports = router;
