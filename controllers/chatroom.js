const {User} = require("../models/user");
const bcrypt = require("bcrypt");

/**
 * Controller function to handle the login process for a user. It checks the email and password
 * provided by the user, compares the password with the stored hash, and logs the user in if
 * the credentials are valid. If the login fails, an error message is shown.
 *
 * @param req - Express request object, containing the user's email and password
 * @param res - Express response object used to redirect the user or render error messages
 * @param next - Express next function, used for error handling
 * @returns {Promise<*>} - The function returns a promise that resolves once the user is logged in or an error is handled
 */
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

/**
 * Controller function to handle the rendering of the chatroom page. It retrieves the logged-in user's information,
 * such as their first name, and passes it to the view to personalize the chatroom. It also handles any messages
 * to be displayed on the chatroom page.
 *
 * @param req - The Express request object containing session data for the logged-in user
 * @param res - The Express response object used to render the chatroom page
 * @param next - The Express next function, used for error handling or forwarding the request
 * @returns {Promise<void>} - The function returns a promise, which resolves once the chatroom page is rendered
 */
exports.getChatroom = async (req, res, next) => {

    const messages = res.locals.messages;
    const msg = messages.length > 0 ? messages : '';
    // Render the chatroom
    const loggedUser = await User.findOne({ where: { id: req.session.userId } , attributes: ['firstName']});
    res.render('chatroom', {username: loggedUser.firstName, msg:msg});
};
