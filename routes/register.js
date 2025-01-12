
var express = require('express');
var router = express.Router();


/* GET register page */
router.get('/', function(req, res, next) {
    res.render('register', { title: 'Chatroom Register' });
});


// // Handle POST request when the user submits the registration form
// router.post('/', function(req, res, next) {
//     const { emailAddress, firstName, lastName } = req.body;
//
//     // You can handle any validation or saving logic here if necessary
//
//     // After registration is successful, redirect to create-password page
//     res.redirect('/register/password');
// });

// Handle POST request when the user submits the registration form
router.post('/', function (req, res, next) {
    const { emailAddress, firstName, lastName } = req.body;

    // Combine user data into a single object
    //const userData = JSON.stringify({ email: emailAddress, firstName, lastName });

    // Set the user data as a cookie (expires in 30 seconds)
   // res.cookie('userInfo', userData, { maxAge: 30000 });

    // Redirect to the password creation page
    res.redirect('/register/create-password');
});

// // Handle GET request for the password creation page
// router.get('/password', function(req, res, next) {
//     res.render('createPassword', { title: 'Choose a Password' });
// });

// Handle GET request for the password creation page
router.get('/create-password', function (req, res, next) {
    // Check if the userInfo cookie exists
    const userInfo = req.cookies.userInfo;
    if (!userInfo) {
        // Redirect back to the register page if the cookie is missing or expired
        res.redirect('/register');
    } else {
        res.render('createPassword', { title: 'Choose a Password' });
    }
});

// Handle POST request for password creation
router.post('/create-password', function (req, res, next) {
    const { password } = req.body;

    // Process the password (e.g., save to database)
    // For example:
    console.log('Password received:', password);

    // Clear the cookie after the user sets the password
    res.clearCookie('userInfo');

    // Redirect to a success or login page
    res.redirect('/login-success');
});


module.exports = router;
