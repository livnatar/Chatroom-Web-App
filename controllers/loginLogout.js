
const createError = require('http-errors');

exports.getLogin = (req, res, next) => {

    const messages = res.locals.messages;       // || req.flash('msg');
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

// exports.postChatroom = async (req, res, next) => {
//     let { emailAddress, password } = req.body;
//
//     // Trim whitespace from email and password
//     emailAddress = emailAddress.trim();
//     password = password.trim();
//
//     try {
//         // Find the user in the database by email
//         const user = await User.findOne({ where: { email: emailAddress } });
//
//         if (!user) {
//             // User not found
//             req.flash('msg', 'Invalid email or password');
//             return res.redirect('/');
//         }
//
//         // Compare the provided password with the stored hashed password
//         const isMatch = await bcrypt.compare(password, user.password);
//
//         if (!isMatch) {
//             // Password doesn't match
//             req.flash('msg', 'Invalid email or password');
//             return res.redirect('/');
//         }
//
//         // Password matches, save the user ID in the session
//         req.session.userId = user.id;
//
//         // Redirect to the chatroom
//         res.redirect('/chatroom');
//
//     } catch (error) {
//         console.error(error);
//         req.flash('msg', 'An error occurred during login. Please try again.');
//         res.redirect('/');
//     }
// };
//
// exports.getChatroom = (req, res, next) => {
//     // Check if the user ID is stored in the session
//     if (!req.session.userId) {
//         req.flash('msg', 'Please log in to access the chatroom');
//         return res.redirect('/');
//     }
//
//     // Render the chatroom
//     res.render('chatroom', { pageTitle: 'Chatroom' });
// };

// exports.postChatroom = (req, res, next) => {
//
//     let { emailAddress, password } = req.body;
//
//     // Trim whitespace from email and password
//     emailAddress = emailAddress.trim();
//     password = password.trim();
//
//     const cookies = new Cookies(req, res, { keys: ['yourSecretKey'] }); // Using a secret key
//
//     // Stringify the object before setting it as a cookie
//     const loginData = JSON.stringify({
//         email: emailAddress,
//         password: password
//     });
//
//     // Create a cookie with signed data (email, password)
//     cookies.set('loginData', loginData,{
//         signed: true,           // Sign the cookie to ensure its integrity
//         maxAge: 24 * 60 * 60 * 1000,  // 24 hours
//         httpOnly: false          // Cookie is only accessible by the server
//     });
//
//     res.redirect('/chatroom');
// };

// exports.getChatroom = (req, res, next) => {
//     // Create a new cookie instance to access the cookies
//     const cookies = new Cookies(req, res, { keys: ['yourSecretKey'] });
//
//     // Get the cookie string
//     const loginDataString = cookies.get('loginData', { signed: true });
//
//     if (!loginDataString) {
//         console.log('No loginData cookie found');
//         return res.redirect('/');
//     }
//
//     // Parse the cookie string back into an object
//     let loginData;
//     try {
//         loginData = JSON.parse(loginDataString);
//     } catch (error) {
//         console.log('Invalid cookie data');
//         return res.redirect('/');
//     }
//
//     const { email, password } = loginData;
//
//     // Delete loginData cookie
//     res.cookie('loginData', '', {maxAge: 0});
//
//     if (User.findIfEmailExists(email)) {  // Note: changed emailAddress to email
//         let user = findUserByEmail(email);
//
//         if (user.checkIfEqualsToPassword(password)) {
//             res.render('chatroom', {pageTitle: 'chatroom'});
//         } else {
//             req.flash('msg', 'Email and password do not match, try again');
//             res.redirect('/');
//         }
//     } else {
//         req.flash('msg', 'Invalid email or password');
//         res.redirect('/');
//     }
// };
