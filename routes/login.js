
var express = require('express');
var router = express.Router();


/* GET login page */
router.get('/', function(req, res, next) {
    res.render('login', { title: 'Chatroom Login' });
});

router.get('/hii', function(req, res, next) {
    res.render('register', { title: 'Chatroom hii.' });
});



module.exports = router;
