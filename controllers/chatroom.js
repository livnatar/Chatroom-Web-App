
const createError = require('http-errors');
const {User} = require("../models/user");
const bcrypt = require("bcrypt");


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

exports.getChatroom = (req, res, next) => {
    // Check if the user ID is stored in the session
    if (!req.session.userId) {
        req.flash('msg', 'Please log in to access the chatroom');
        return res.redirect('/login');
    }

    // Render the chatroom
    res.render('chatroom', { pageTitle: 'Chatroom' });
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
