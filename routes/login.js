
var express = require('express');
var router = express.Router();


/* GET login page */
router.get('/', function(req, res, next) {
    res.render('login', { title: 'Chatroom Login' });
});

router.get('/login-success', function(req, res, next) {
    res.render('login', { msg: 'Registration successful, you can now login' });
});



module.exports = router;
