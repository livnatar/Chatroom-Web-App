
const createError = require('http-errors');
const {Message} = require("../models/message");
const {User} = require("../models/user");
const {Op} = require("sequelize");
const Sequelize = require("sequelize");


exports.getSearchPage = (req, res, next) => {
    res.render('searchPage', {
        messages: res.locals.foundMessages,
        query: res.locals.query
    });
};

exports.postFindMessages = async (req, res, next) => {
    try {
        const query = req.body.query || '';
        console.log('Search Query:', query);

        const filteredMessages = await Message.findAll({
            where: {
                input: {
                    [Op.like]: `%${query.trim()}%`
                }
            },
            include: {
                model: User,
                attributes: ['firstName', 'lastName'],
            },
            order: [
                ['createdAt', 'DESC']
            ],
            paranoid: true
        });

        console.log('Found Messages:', filteredMessages.length);

        const plainMessages  =  filteredMessages.length !== 0 ? filteredMessages: '' ;

        // Store the plain objects in flash
        req.flash('foundMessages', plainMessages);
        req.flash('query', query);

        res.redirect('/chatroom/search');

    } catch (err) {
        console.error('Search Error:', err);
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
            req.flash('msg', `Invalid input, message cannot be empty`);
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
            return next(createError(500, `Unexpected error, ${err.message}`));
        }
    }
}
