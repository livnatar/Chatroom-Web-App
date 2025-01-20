
const Sequelize = require('sequelize');
//const {User, findIfEmailExists} = require("../models/user");
const { User } = require("../models/user");


exports.getRegister = (req, res, next) => {

    const messages = res.locals.messages || req.flash('msg');
    const msg = messages.length > 0 ? messages[0] : '';
    res.render('register', { msg, pageTitle: 'Register' });
};

exports.getAccountCreated = (req, res, next) => {
    res.redirect('/');
};

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
            const newUser = await User.create({firstName:userInfo.firstName, lastName:userInfo.lastName, email:userInfo.email, password:password.trim()});

            // Clear the cookie after the user sets the password
            res.clearCookie('userInfo');

            // Redirect to login page
            req.flash('msg', 'Registration completed successfully! You may now log in');
            res.redirect('/');
        }
    }
    catch (err) {
        // Handle validation errors
        if (err instanceof Sequelize.ValidationError) {
            req.flash('msg', `Invalid input: ${err.message}`);
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
            req.flash('msg', `Unexpected error: ${err.message}`);
            res.redirect('/register');
        }
    }
};

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

exports.postCreatePassword = async (req, res, next) => {

    const { emailAddress, firstName, lastName } = req.body;
    try {
        const findUser = await User.findOne({where: {email: emailAddress}})
        if (findUser) {
            req.flash('msg', 'Email already exists, please try a different email');
            res.redirect('/register');
        }

        res.redirect('/register/create-password');
    }
    catch (err) {
        if (err instanceof Sequelize.DatabaseError) {
            req.flash('msg', `Database error: ${err.message}`);
            res.redirect('/register');
        }
        // Handle unexpected errors
        else {
            req.flash('msg', `Unexpected error: ${err.message}`);
            res.redirect('/register');
        }
    }
};



// const Sequelize = require('sequelize');
// //const {User, findIfEmailExists} = require("../models/user");
// const User = require("../models/user");
//
//
// exports.getRegister = (req, res, next) => {
//
//     const messages = res.locals.messages || req.flash('msg');
//     const msg = messages.length > 0 ? messages[0] : '';
//     res.render('register', { msg, pageTitle: 'Register' });
// };
//
// exports.getAccountCreated = (req, res, next) => {
//     res.redirect('/');
// };
//
// exports.postAccountCreated = (req, res, next) => {
//
//     let newId = generateId();
//     try {
//         const { password } = req.body;
//
//         if (!req.cookies.userInfo) {
//             // If no user data is available (cookie expired or not found), redirect back to the register page
//             req.flash('msg', 'Oops! It seems like you have been away for a bit too long. Please start over to continue your registration.');
//             res.redirect('/register');
//         }
//         else {
//
//             const userInfo = JSON.parse(req.cookies.userInfo);
//             const user = new User(userInfo.email, password.trim(), userInfo.firstName, userInfo.lastName, newId);
//             user.addUser();
//
//             // Clear the cookie after the user sets the password
//             res.clearCookie('userInfo');
//
//             // Redirect to login page
//             req.flash('msg', 'Registration completed successfully! You may now log in');
//             res.redirect('/');
//         }
//     }
//     catch (err) {
//         req.flash('msg', err);
//         res.redirect('/register');
//     }
//
// };
//
// exports.getCreatePassword = (req, res, next) => {
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
//
// };
//
// exports.postCreatePassword = (req, res, next) => {
//
//     const { emailAddress, firstName, lastName } = req.body;
//
//     // can be removed once the controller catch will have the rendering
//     if (findIfEmailExists(emailAddress)){
//         req.flash('msg', 'Email already exists, please try a different email');
//         res.redirect('/register');
//     }
//
//     res.redirect('/register/create-password');
// };
//
//
// const generateId = () => {
//     // get the length of the array and add 1 to it.
//     return User.getLength() + 1;
// }