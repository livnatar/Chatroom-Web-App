

// Middleware to check if the user is not logged in
const isNotLoggedIn = (req, res, next) => {
    if (req.session.userId) {
        // If user is logged in, redirect to chatroom
        return res.redirect('/chatroom');
    }
    next(); // If not logged in, proceed to the next middleware/route
};


// Middleware to check if session expired in order to know if we can stay in the chatroom
const checkIfSessionExists = (req, res, next) => {

    // Check if the user ID is stored in the session
    if (!req.session.userId) {
        req.flash('msg', 'Please log in to access the chatroom');
        return res.redirect('/login');
    }
    next(); // If not logged in, proceed to the next middleware/route
};


// // REST_API- Middleware to check if the user is logged in
// const checkSession = (req, res, next) => {
//
//     if (!req.session || !req.session.userId) {
//
//         // Return 401 Unauthorized if session is missing or user is not logged in
//         return res.status(401).json({ message: 'Unauthorized: User not logged in' });
//     }
//     next(); // Proceed to the next middleware or route handler
// };

const checkSession = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        // Return 401 Unauthorized if session is missing
        return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }

    // Respond if the path is `/api`, otherwise proceed to the next middleware
    if (req.path === '/') {
        return res.status(200).json({ message: 'Session is valid' });
    }

    next(); // Proceed to the next middleware or route handler
};



module.exports = {isNotLoggedIn, checkIfSessionExists, checkSession};