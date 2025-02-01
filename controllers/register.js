const Sequelize = require('sequelize');
const { User } = require("../models/user");
const createError = require('http-errors');

/**
 * Controller function to render the registration page.
 * Retrieves flash messages if available and passes them to the view.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function (not used but included for consistency)
 */
exports.getRegister = (req, res, next) => {

    const messages = res.locals.messages || req.flash('msg');
    const msg = messages.length > 0 ? messages[0] : '';
    res.render('register', { msg, pageTitle: 'Register' });
};

/**
 * Controller function to handle successful account creation.
 * Redirects the user to the homepage after account creation.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function (not used but included for consistency)
 */
exports.getAccountCreated = (req, res, next) => {
    res.redirect('/');
};

/**
 * Controller function to handle the completion of account creation.
 * It retrieves user information from cookies, creates a new user,
 * and clears the cookie. If there are any errors (validation, unique constraint, etc.),
 * it handles them and redirects accordingly.
 *
 * @param req - Express request object containing user data and cookies
 * @param res - Express response object used for sending responses or redirects
 * @param next - Express next function to pass control to the next middleware (used for error handling)
 * @returns {Promise<*>} - Returns a promise that resolves when the operation is complete
 */
exports.postAccountCreated = async (req, res, next) => {

    try {
        const { password } = req.body;

        if (!req.cookies.userInfo) {
            // If no user data is available (cookie expired or not found), redirect back to the register page
            req.flash('msg', 'Oops! It seems like you have been away for a bit too long. Please start over to continue your registration.');
            res.redirect('/register');
        }
        else {
            const userInfo = JSON.parse(req.cookies.userInfo);
            const newUser = await User.create({firstName:userInfo.firstName, lastName:userInfo.lastName, email:userInfo.email.toLowerCase(), password:password.trim()});

            // Clear the cookie after the user sets the password
            res.clearCookie('userInfo');

            // Redirect to login page
            req.flash('msg', 'Registration completed successfully! You may now log in');
            res.redirect('/login');
        }
    }
    catch (err) {
        // Handle validation errors
        if (err instanceof Sequelize.ValidationError) {
            req.flash('msg', `Invalid input (${err.message})`);
            res.redirect('/register');
        }
        // Handle unique constraint errors
        else if (err instanceof Sequelize.UniqueConstraintError) {
            req.flash('msg', "This email is already registered. Please use a different email address.");
            res.redirect('/register');
        }
        // Handle database errors
        else if (err instanceof Sequelize.DatabaseError) {
            req.flash('msg', `Database error: ${err.message}`);
            res.redirect('/register');
        }
        // Handle unexpected errors
        else {
            // Pass the error to the central error-handling middleware
            return next(createError(500, `Unexpected error: ${err.message}`));
        }
    }
};

/**
 * Controller function to render the create password page.
 * It checks if the userInfo cookie exists, and if so, renders the
 * create password page with the appropriate details. If the cookie is
 * missing or expired, the user is redirected to the register page.
 *
 * @param req - Express request object, containing the cookies and session data
 * @param res - Express response object used for rendering views or redirecting
 * @param next - Express next function (not used but included for consistency)
 */
exports.getCreatePassword = (req, res, next) => {
    // Check if the userInfo cookie exists
    const userInfo = req.cookies.userInfo;
    if (!userInfo) {

        // Redirect back to the register page if the cookie is missing or expired
        res.redirect('/register');
    }
    else {
        // Pass user data to the create-password view (to show email or other details)
        res.render('createPassword', {msg: '', pageTitle:'Create Password'});
    }

};

/**
 * Controller function to handle the creation of a password and user registration.
 * It checks if the email address already exists in the database and provides
 * feedback accordingly. If the email does not exist, it redirects to the create
 * password page. If there are any errors (database or unexpected), they are handled
 * and appropriate messages are shown.
 *
 * @param req - Express request object containing the user input (email, first name, last name)
 * @param res - Express response object used for redirecting or sending responses
 * @param next - Express next function for passing control to the next middleware (error handling)
 * @returns {Promise<*>} - A promise that resolves once the operation is complete
 */
exports.postCreatePassword = async (req, res, next) => {

    const { emailAddress, firstName, lastName } = req.body;
    try {
        const findUser = await User.findOne({where: {email: emailAddress.toLowerCase()}})
        if (findUser) {
            req.flash('msg', 'Email already exists, please try a different email');
            res.redirect('/register');
        }

        res.redirect('/register/create-password');
    }
    catch (err) {
        if (err instanceof Sequelize.DatabaseError) {
            req.flash('msg', `A database error occurred, please try again later.`);
            res.redirect('/register');
        }
        // Handle unexpected errors
        else {
            // Pass the error to the central error-handling middleware
            return next(createError(500, `Unexpected error: ${err.message}`));
        }
    }
};

