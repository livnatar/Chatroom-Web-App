
const createError = require('http-errors');
const {User} = require("../models/user");
const {Message} = require("../models/message");
const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");


exports.postChatroom = async (req, res, next) => {
    let { emailAddress, password } = req.body;

    // Trim whitespace from email and password
    emailAddress = emailAddress.trim().toLowerCase();
    password = password.trim();

    try {
        // Find the user in the database by email
        const user = await User.findOne({ where: { email: emailAddress } });

        if (!user) {
            // User not found
            req.flash('msg', 'Invalid email or password');
            return res.redirect('/login');
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Password doesn't match
            req.flash('msg', 'Invalid email or password');
            return res.redirect('/login');
        }

        // Password matches, save the user ID in the session
        req.session.userId = user.id;

        // Redirect to the chatroom
        res.redirect('/chatroom');

    } catch (error) {
        console.error(error);
        req.flash('msg', 'An error occurred during login. Please try again.');
        res.redirect('/');
    }
};

exports.getChatroom = async (req, res, next) => {

    // Check if the user ID is stored in the session
    if (!req.session.userId) {
        req.flash('msg', 'Please log in to access the chatroom');
        return res.redirect('/login');
    }

    // Render the chatroom
    const loggedUser = await User.findOne({ where: { id: req.session.userId } , attributes: ['firstName']});
    res.render('chatroom', { pageTitle: 'Chatroom', username: loggedUser.firstName, msg:''});
};

exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            // Pass the error to the central error-handling middleware
            return next(createError(500, 'An error occurred during logout'));
        }
        res.redirect('/login');
    });
};

exports.sendMessage = async (req, res, next) => {

    try {
        const { message } = req.body;
        console.log(`try to sent the message - ${message}`);

        if (!req.session.userId) {
            // If no user data is available (cookie expired or not found), redirect back to the register page
            req.flash('msg', 'Oops! It seems like you have been away for a bit too long');
            res.redirect('/login');
        }

        else {
            const newMsg = await Message.create({user_id:req.session.userId, input:message});
            res.redirect('/chatroom');
        }
    }
    catch (err) {
        // Handle validation errors
        if (err instanceof Sequelize.ValidationError) {
            req.flash('msg', `Invalid input: ${err.message}`);
            res.redirect('/chatroom');
        }
        // Handle database errors
        else if (err instanceof Sequelize.DatabaseError) {
            req.flash('msg', `Database error: ${err.message}`);
            res.redirect('/chatroom');
        }
        // Handle unexpected errors
        else {
            // Pass the error to the central error-handling middleware
            return next(createError(500, `Unexpected error: ${err.message}`));
        }
    }
}

exports.getSearchPage = (req, res, next) => {

    // Check if the user ID is stored in the session
    if (!req.session.userId) {
        req.flash('msg', 'Please log in to access the chatroom');
        return res.redirect('/login');
    }

    res.render('searchPage');
};