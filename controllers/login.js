

const User = require('../models/user');
const {findUserByEmail} = require("../models/user");


exports.getLogin = (req, res, next) => {
    res.render('login', {msg: '', pageTitle:'Login'});
};

exports.getChatroom = (req, res, next) => {
    res.redirect('/');
};

exports.postChatroom = (req, res, next) => {

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
};