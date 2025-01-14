
var express = require('express');
var router = express.Router();
//const User = require('../models/user');
const registerController = require('../controllers/register');

//const {User, findIfEmailExists, findUserByEmail, printList} = require("../models/user");


/* GET register page */
router.get('/', registerController.getRegister);  //  function(req, res, next) {
   // res.render('register', {msg: '', pageTitle:'Register'});
//});


// Handle POST request when the user submits the registration form
router.post('/create-password', registerController.postCreatePassword)//, function (req, res, next) {

//     const { emailAddress, firstName, lastName } = req.body;
//
//     if (findIfEmailExists(emailAddress)){
//         res.render('register', {msg: 'Email already registered, try again', pageTitle:'Register'});
//     }
//     // else {
//     //     // Combine user data into a single object
//     //     // const userData = JSON.stringify({ email: emailAddress, firstName, lastName });
//     //
//     //     // Set the user data as a cookie (expires in 30 seconds)
//     //     // res.cookie('userInfo', userData, { maxAge: 30000 });
//     //
//     //     // add user to the list of users
//     //     // const user = new User(emailAddress);
//     //     // user.addUser();
//     //
//     //     // Redirect to the password creation page
//     //     res.redirect('/register/create-password');
//     // }
//
//     res.redirect('/register/create-password');
//
// });


// Handle GET request for the password creation page
router.get('/create-password',registerController.getCreatePassword );//function (req, res, next) {

//     // Check if the userInfo cookie exists
//     const userInfo = req.cookies.userInfo;
//     if (!userInfo) {
//
//         // Redirect back to the register page if the cookie is missing or expired
//         res.redirect('/register');
//     }
//     else {
//         // Pass user data to the create-password view (to show email or other details)
//         res.render('createPassword', {msg: '', pageTitle:'Create Password'});
//     }
// });

// Handle POST request for password creation
router.post('/account-created', registerController.accountCreated); //function (req, res, next) {

    // const { password } = req.body;
    // const userInfo = req.cookies.userInfo;
    //
    // if (!userInfo) {
    //     // If no user data is available (cookie expired or not found), redirect back to the register page
    //     // maybe add a message that too much time passed until pressed submit and the cookie deleted
    //     res.redirect('/register');
    // }
    // else {
    //
    //     const user = new User(userInfo.email, password, userInfo.firstName, userInfo.lastName);
    //     user.addUser();
    //     // remember to add try and catch when moving to controller
    //
    //     // Clear the cookie after the user sets the password
    //     res.clearCookie('userInfo');
    //
    //     // Redirect to login page
    //     res.render('login', { msg: 'Registration completed successfully! You may now log in', pageTitle:'Login'});
    // }

//});

router.get('/account-created', registerController.getAccountCreated);

module.exports = router;
