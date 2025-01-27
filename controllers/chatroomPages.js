
const createError = require('http-errors');
const {Message} = require("../models/message");
const Sequelize = require("sequelize");


exports.getSearchPage = (req, res, next) => {
    // Render the search page without messages initially
    res.render('searchPage', { messages: undefined });
};

exports.postFindMessages= async(req,res,next) => {

    try {
        const query = req.body.query || '';  // Get the search query from the form (POST data)

        // Use Sequelize to search for messages that include the query (case-insensitive using LIKE in SQLite)
        const filteredMessages = await Message.findAll({
            where: {
                message: {
                    [Sequelize.Op.like]: `%${query.trim()}%`,  // Case-insensitive search using LIKE for SQLite
                },
            },
        });

        // Render the results to the 'search' page with filtered messages
        res.render('searchPage', {
            messages: filteredMessages,  // Pass the filtered messages to the EJS template
        });

    } catch (err) {
        // Pass the error to the central error-handling middleware
        return next(createError(500, `Unexpected error: ${err.message}`));
    }
};

exports.sendMessage = async (req, res, next) => {

    try {
        const { message } = req.body;
        console.log(`try to sent the message - ${message}`);

        if (!req.session.userId) {
            // If no user data is available (cookie expired or not found), redirect back to the register page
            req.flash('msg', 'Oops! It seems like you have been away for a bit too long');
            res.redirect('/login');
        }

        else {
            const newMsg = await Message.create({user_id:req.session.userId, input:message});
            res.redirect('/chatroom');
        }
    }
    catch (err) {
        // Handle validation errors
        if (err instanceof Sequelize.ValidationError) {
            req.flash('msg', `Invalid input: ${err.message}`);
            res.redirect('/chatroom');
        }
        // Handle database errors
        else if (err instanceof Sequelize.DatabaseError) {
            req.flash('msg', `Database error: ${err.message}`);
            res.redirect('/chatroom');
        }
        // Handle unexpected errors
        else {
            // Pass the error to the central error-handling middleware
            return next(createError(500, `Unexpected error: ${err.message}`));
        }
    }
}

exports.getFindMessages = (req,res,next) => {
    res.redirect('/');
};
