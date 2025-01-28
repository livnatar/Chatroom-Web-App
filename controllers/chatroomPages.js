
const createError = require('http-errors');
const {Message} = require("../models/message");
const {Op} = require("sequelize");


exports.getSearchPage = (req, res, next) => {

    // if (!req.session.userId) {
    //     req.flash('msg', 'Please log in to access the chatroom');
    //     return res.redirect('/login');
    // }

    // Render the search page without messages initially
    res.render('searchPage', { messages: undefined });
};

exports.postFindMessages = async (req, res, next) => {
    try {
        const query = req.body.query || '';

        // Search for messages containing the query string
        // With paranoid: true, Sequelize automatically excludes records where deletedAt is not null
        const filteredMessages = await Message.findAll({
            where: {
                input: {
                    [Op.like]: `%${query.trim()}%`
                }
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });

        res.render('searchPage', {
            messages: filteredMessages,
            query: query
        });

    } catch (err) {
        next(createError(500, `Search error: ${err.message}`));
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
