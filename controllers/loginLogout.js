
const createError = require('http-errors');

exports.getLogin = (req, res, next) => {

    const messages = res.locals.messages;
    const msg = messages.length > 0 ? messages[0] : '';
    const isSuccess = msg.includes('success') | msg.includes('Please') ;
    res.render('login', { msg, isSuccess, pageTitle: 'Login' });
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
