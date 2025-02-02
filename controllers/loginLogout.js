const createError = require('http-errors');

/**
 * Controller function to render the login page. It checks if there are any
 * messages passed through the `res.locals.messages` and displays them on
 * the login page. The function also checks if the message indicates a success
 * or informational message and adjusts the rendering accordingly.
 *
 * @param req - Express request object, containing any session or user data
 * @param res - Express response object used for rendering the login view
 * @param next - Express next function, passed for consistency (not used here)
 */
exports.getLogin = (req, res, next) => {

    const messages = res.locals.messages;
    const email = res.locals.oldEmail;
    const password = res.locals.oldPassword;

    const msg = messages.length > 0 ? messages[0] : '';
    const isSuccess = msg.includes('success') | msg.includes('Please') ;
    const oldEmail = email.length > 0 ? email[0] : '' ;
    const oldPassword = password.length > 0 ? password[0] : '';

    res.render('login', {msg: msg,
                         isSuccess: isSuccess,
                         pageTitle: 'Login',
                         oldEmail: oldEmail,
                         oldPassword:oldPassword });
};

/**
 * Controller function to handle the logout process. It destroys the user's session
 * and redirects them to the login page. If an error occurs during session destruction,
 * it is passed to the central error-handling middleware.
 *
 * @param req - Express request object, typically containing session data
 * @param res - Express response object used for redirecting the user
 * @param next - Express next function to pass errors to the error-handling middleware
 */
exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            // Pass the error to the central error-handling middleware
            return next(createError(500, 'An error occurred during logout'));
        }
        res.redirect('/login');
    });
};
