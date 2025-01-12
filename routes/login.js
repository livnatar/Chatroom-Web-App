
var express = require('express');
var router = express.Router();


/* GET login page */
router.get('/', function(req, res, next) {
    res.render('login', {msg: ''});
});


// add post method that if the password or email are invalid adds this message {msg: "invalid email or password"} and stays on the same path
// Handle POST request when the user submits the login form

router.post('/', function (req, res, next) {
    const { emailAddress, password } = req.body;

    // check inside the database if the email and password match
    if (true) {

        // Redirect to the chatroom page
        res.redirect('/chatroom'); //add this path in apps
    }
    else {
        // stay on the same page and send the msg
        res.render('login', {msg: 'invalid email or password'});

    }
});



router.get('/login-success', function(req, res, next) {
    res.render('login', { msg: 'Registration completed successfully! You may now log in' });
});



module.exports = router;
