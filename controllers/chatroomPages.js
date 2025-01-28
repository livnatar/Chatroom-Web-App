
const createError = require('http-errors');
const {Message} = require("../models/message");
const {User} = require("../models/user");
const {Op} = require("sequelize");


exports.getSearchPage = (req, res, next) => {
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
            include: {
                model: User,
                attributes: ['firstName', 'lastName'], // Include user details
            },
            order: [
                ['createdAt', 'DESC']
            ],
            paranoid: true // Exclude soft-deleted messages
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

        const newMsg = await Message.create({user_id:req.session.userId, input:message});
        res.redirect('/chatroom');

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
