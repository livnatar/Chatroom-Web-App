
const createError = require('http-errors');
const {Message} = require("../models/message");
const {User} = require("../models/user");
const {Op} = require("sequelize");

/**
 * Controller function to handle rendering the search page. It retrieves
 * and passes the search results and the search query to the view for display.
 *
 * @param req - Express request object, typically contains query parameters (e.g., search query)
 * @param res - Express response object used to render the search page with data
 * @param next - Express next function, passed for consistency (not used here)
 */
exports.getSearchPage = (req, res, next) => {
    res.render('searchPage', {
        messages: res.locals.foundMessages,
        query: res.locals.query
    });
};

/**
 * Controller function to handle searching for messages based on a query. It retrieves
 * messages that match the query, includes user information, and redirects the user
 * to the search results page.
 *
 * @param req - Express request object, containing the search query from the request body
 * @param res - Express response object used to redirect the user to the search results page
 * @param next - Express next function, used to pass errors to the error handler
 * @returns {Promise<void>} - The function returns a promise indicating the search operation
 */
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
        // Create and pass an error to the next middleware
        next(createError(500, `Search error: ${err.message}`));
    }
};

