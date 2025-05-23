
const {Message} = require('../models/message');

/**
 * Middleware to check if the user is not logged in.
 * If the user is logged in, they are redirected to the chatroom.
 * Otherwise, the request proceeds to the next middleware or route.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function to pass control to the next middleware
 * @returns {*} - Redirects if the user is logged in, otherwise calls `next()`
 */
const isNotLoggedIn = (req, res, next) => {
    if (req.session.userId) {
        // If user is logged in, redirect to chatroom
        return res.redirect('/chatroom');
    }
    next();
};

/**
 * Middleware to check if the user's session is still active.
 * If the session has expired (i.e., no user ID in session), the user is redirected to the login page
 * with a flash message. Otherwise, the request proceeds to the next middleware or route.
 *
 * @param req - Express request object containing session data
 * @param res - Express response object used for redirection
 * @param next - Express next function to pass control to the next middleware
 * @returns {*} - Redirects if the session is expired, otherwise calls `next()`
 */
const checkIfSessionExists = (req, res, next) => {

    // Check if the user ID is stored in the session
    if (!req.session.userId) {
        req.flash('msg', 'Please log in to access the chatroom');
        return res.redirect('/login');
    }
    next();
};

/**
 * Middleware to check if the user's session is still active.
 * If the session is missing or expired, it sends a 401 Unauthorized response.
 * If the request is a browser-based request (a GET request or if the client accepts HTML),
 * it redirects the user to an error page. For API requests, it sends a JSON response.
 * Otherwise, it allows the request to proceed to the next middleware or route handler.
 *
 * @param req - Express request object containing session data
 * @param res - Express response object used for sending responses
 * @param next - Express next function to pass control to the next middleware
 * @returns {*} - Returns a JSON response for session status or calls `next()`
 */
const checkSession = (req, res, next) => {

    if (!req.session || !req.session.userId) {
        // Handle the case where the session is missing or expired
        req.flash('msg', 'Oops! It seems like you have been away for a bit too long');

        // Check if the client accepts HTML (likely a browser)
        if (req.method === 'GET' || req.accepts('html')) {
            // If it's a regular browser request, redirect to an error page (like a login page)
            return res.redirect('/error');  // Redirect to your error page, can be custom like '/login' too
        }

        // Return JSON response with a 401 Unauthorized status for API requests
        return res.status(401).json({ message: 'Oops! It seems like you have been away for a bit too long' });
    }

    // If session is valid, proceed with the next middleware or route handler
    next();
};

/**
 * Checks if the user has permission to perform an action on the message
 * by comparing the session ID with the user ID associated with the message.
 *
 * @param msgId - The ID of the message to check.
 * @param sessionId - The ID of the user’s current session.
 * @returns {Promise<boolean>} - Returns a promise that resolves to true if the user owns the message, false otherwise.
 */
const checkPermission = async (msgId,sessionId) => {

    const user = await Message.findOne({where: {id: msgId}, attribute:['user_id']});
    return user.user_id === sessionId;
};

module.exports = {isNotLoggedIn, checkIfSessionExists, checkSession, checkPermission};