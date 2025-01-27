

// Middleware to check if the user is not logged in
const isNotLoggedIn = (req, res, next) => {
    if (req.session.userId) {
        // If user is logged in, redirect to chatroom
        return res.redirect('/chatroom');
    }
    next(); // If not logged in, proceed to the next middleware/route
};

// Middleware to check if the user is logged in
const checkSession = (req, res, next) => {

    if (!req.session || !req.session.userId) {

        // Return 401 Unauthorized if session is missing or user is not logged in
        return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }
    next(); // Proceed to the next middleware or route handler
};


module.exports = {isNotLoggedIn, checkSession};