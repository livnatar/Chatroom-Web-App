
const {User, findIfEmailExists} = require("../models/user");


exports.getRegister = (req, res, next) => {
    res.render('register', {msg: '', pageTitle:'Register'});
};

exports.getAccountCreated = (req, res, next) => {
    res.redirect('/');
};

exports.accountCreated = (req, res, next) => {
    let newId = generateId();
    try {
        const { password } = req.body;
        const userInfo = JSON.parse(req.cookies.userInfo);

        if (!userInfo) {
            // If no user data is available (cookie expired or not found), redirect back to the register page
            // maybe add a message that too much time passed until pressed submit and the cookie deleted
            res.redirect('/register');
        }
        else {

            const user = new User(userInfo.email, password.trim(), userInfo.firstName, userInfo.lastName, newId);
            user.addUser();

            // Clear the cookie after the user sets the password
            res.clearCookie('userInfo');

            // Redirect to login page
            res.render('login', { msg: 'Registration completed successfully! You may now log in', pageTitle:'Login'});
        }
    } catch (err) {
        // TO DO! we must handle the error here and generate a EJS page to display the error.
        console.log(`Error: ${err}`)
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

exports.postCreatePassword = (req, res, next) => {

    const { emailAddress, firstName, lastName } = req.body;

    if (findIfEmailExists(emailAddress)){
        res.render('register', {msg: 'Email already registered, try again', pageTitle:'Register'});
    }
    // else {
    //     // Combine user data into a single object
    //     // const userData = JSON.stringify({ email: emailAddress, firstName, lastName });
    //
    //     // Set the user data as a cookie (expires in 30 seconds)
    //     // res.cookie('userInfo', userData, { maxAge: 30000 });
    //
    //     // add user to the list of users
    //     // const user = new User(emailAddress);
    //     // user.addUser();
    //
    //     // Redirect to the password creation page
    //     res.redirect('/register/create-password');
    // }

    res.redirect('/register/create-password');

};


const generateId = () => {
    // get the length of the array and add 1 to it.
    return User.getLength() + 1;
}