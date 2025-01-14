
var express = require('express');
var router = express.Router();
const User = require('../models/user');
const {findUserByEmail} = require("../models/user");


/* GET login page */
router.get('/', function(req, res, next) {
    res.render('login', {msg: '', pageTitle:'Login'});
});


// // Handle POST request when the user submits the login form
// router.post('/', function (req, res, next) {
//     const { emailAddress, password } = req.body;
//
//     // check inside the database if the email and password match
//     //also if it's in the database
//
//     let user = findUserByEmail(emailAddress);
//
//     // remember to check validation
//     //let validatePassword = password.trim();
//
//     if (User.findIfEmailExists(emailAddress) && user.checkIfEqualsToPassword(password)) {
//
//         // Redirect to the chatroom page
//         res.redirect('/chatroom');
//     }
//     else {
//         // stay on the same page and send the msg
//         res.render('login', {msg: 'Invalid email or password',pageTitle:'Login'});
//     }
// });


//
// router.get('/login-success', function(req, res, next) {
//     res.render('login', { msg: 'Registration completed successfully! You may now log in', pageTitle:'Login'});
// });


router.get('/chatroom', function(req, res, next) {

    res.redirect('/');
});

router.post('/chatroom', function(req, res, next) {

    const { emailAddress, password } = req.body;

    if (User.findIfEmailExists(emailAddress)) {

        let user = findUserByEmail(emailAddress);

        if (user.checkIfEqualsToPassword(password)) {
            // Show to the chatroom page
            res.render('chatroom'); // changes here to redirect
        }
        else {
            // stay on the same page and send the msg
            res.render('login', {msg: 'Invalid email or password', pageTitle:'Login'});
        }
    }
    else {
        res.redirect('/');
    }
});


// router.post('/chatroom', function(req, res, next) {
//
//     // const { emailAddress, password } = req.body;
//     //
//     // // check inside the database if the email and password match
//     // //also if it's in the database
//     //
//     // let user = findUserByEmail(emailAddress);
//     //
//     // // remember to check validation
//     // //let validatePassword = password.trim();
//     //
//     // if (User.findIfEmailExists(emailAddress) && user.checkIfEqualsToPassword(password)) {
//     //     // Show to the chatroom page
//     //     res.redirect('/chatroom'); // changes here to redirect
//     // }
//     // else {
//     //     // stay on the same page and send the msg
//     //     res.render('login', {msg: 'Invalid email or password', pageTitle:'Login'});
//     // }
//
//     res.redirect('/chatroom'); // changes here to redirect
//
// });
//
// router.get('/chatroom', function(req, res, next) {
//
//     const { emailAddress, password } = req.body;
//
//     // check inside the database if the email and password match
//     //also if it's in the database
//     if (User.findIfEmailExists(emailAddress)) {
//
//         let user = findUserByEmail(emailAddress);
//
//         if (user.checkIfEqualsToPassword(password)) {
//             // Show to the chatroom page
//             res.render('chatroom'); // changes here to redirect
//         }
//         else {
//             // stay on the same page and send the msg
//             res.render('login', {msg: 'Invalid email or password', pageTitle:'Login'});
//         }
//     }
//     else {
//         res.redirect('/');
//     }
// });
module.exports = router;
