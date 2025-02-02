const {Message} = require('../models/message');
const {User} = require('../models/user');
const Sequelize = require("sequelize");


/**
 * Controller function to handle fetching existing messages from the database. It compares the `lastUpdate`
 * timestamp provided in the request body with the latest message updates or deletions in the database.
 *
 * Based on the comparison, it returns the messages and the status (whether they have been updated, deleted, or not changed).
 *
 * @param req - The Express request object containing the `lastUpdate` timestamp from the client.
 * @param res - The Express response object used to send the response with the message status and data.
 * @param next - The Express next function used for error handling or forwarding the request.
 * @returns {Promise<*>} - The function returns a promise that resolves with the status and messages or error data.
 */
exports.existingMessages = async (req, res, next) => {
    const lastUpdate = new Date(req.body.lastUpdate);

    try {
        const currentUserId = req.session.userId;

        // Find the latest updatedAt timestamp, including deleted records
        const maxUpdatedAt = await Message.findOne({
            attributes: ['updatedAt'],
            order: [['updatedAt', 'DESC']],
            limit: 1,
            paranoid: false // Include soft-deleted records
        });

        // Find the latest deletedAt timestamp
        const maxDeletedAt = await Message.findOne({
            attributes: ['deletedAt'],
            order: [['deletedAt', 'DESC']],
            limit: 1,
            paranoid: false // Include soft-deleted records
        });

        // Fetch all non-deleted messages
        const nonDeletedMessages = await Message.findAll({
            attributes: ['id', 'user_id', 'input', 'createdAt'],
            include: {
                model: User,
                attributes: ['firstName', 'lastName'],
            },
            paranoid: true // Don't include soft-deleted messages
        });

        // If there are no non-deleted messages, check why
        if (nonDeletedMessages.length === 0) {
            if (!maxUpdatedAt?.updatedAt && !maxDeletedAt?.deletedAt) {
                // Case: The database is completely empty
                return res.json({ status: 'INITIAL_LOAD', messages: [] });
            }

            if (maxDeletedAt?.deletedAt && maxDeletedAt.deletedAt > lastUpdate) {
                // Case: All messages have been deleted since lastUpdate
                return res.json({ status: 'ALL_DELETED', messages: [] });
            }
        }

        // Determine the latest relevant timestamp (updates or deletions)
        const maxUpdatedTime = maxUpdatedAt ? new Date(maxUpdatedAt.updatedAt).getTime() : 0;
        const maxDeletedTime = maxDeletedAt ? new Date(maxDeletedAt.deletedAt).getTime() : 0;
        const maxTime = Math.max(maxUpdatedTime, maxDeletedTime);

        if (maxTime > lastUpdate.getTime()) {
            // Case: There are updated messages
            const filteredMessages = nonDeletedMessages.map((message) => ({
                id: message.id,
                username: `${message.User.firstName} ${message.User.lastName}`,
                message: message.input,
                timestamp: message.createdAt,
                isOwnedByUser: message.user_id === currentUserId,
            }));

            return res.json({
                status: 'UPDATED',
                messages: filteredMessages
            });
        } else {
            // Case: No changes since the last update
            return res.json({ status: 'NO_CHANGE', messages: [] });
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

/**
 * Controller function to handle the deletion of a message. It ensures that the message belongs to the currently
 * authenticated user before attempting to delete it from the database.
 *
 * @param req - The Express request object containing the `msgId` for the message to be deleted.
 * @param res - The Express response object used to send the success or failure status back to the client.
 * @param next - The Express next function used for error handling or forwarding the request.
 * @returns {Promise<*>} - The function returns a promise that resolves with the deletion status or an error message.
 */
exports.findAndDeleteMsg = async (req, res, next) => {

    try {
        const messageId = req.body.msgId;

        // Delete the message if user_id matches
        await Message.destroy({
            where: { id: messageId }
        });

        res.json({ deleted: true });
    }
    catch (error) {
        console.error('Error deleting message:', error);
        return res.status(500).json({ authenticated: false });
    }
};

/**
 * Controller function to update a message's content.
 *
 * @param req - The Express request object containing the `msgId` for the message to be updated and `newInput` for the updated message content.
 * @param res - The Express response object used to send the success or failure status back to the client.
 * @param next - The Express next function used for error handling or forwarding the request.
 * @returns {Promise<*>} - The function returns a promise that resolves with the update status or an error message.
 */
exports.saveMsg = async (req, res, next) => {
    try{
        const messageId = req.body.msgId;
        const newMsg = req.body.newInput;

        await Message.update(
            { input: newMsg },
            { where: { id: messageId } });

        res.json({ updated: true, newInput: newMsg });
    }
    catch (err) {
        // Use the centralized error handler
        return handleError(err, req, res);
    }
};

/**
 * Controller function to handle sending a new message.
 *
 * @param req - The Express request object containing the message data to be sent.
 * @param res - The Express response object used to send the response back to the client.
 * @param next - The Express next function used for error handling or forwarding the request.
 * @returns {Promise<*>} - The function returns a promise that resolves with the status of the message send or an error message.
 */
exports.sendMsg = async (req, res, next) => {
    try {
        const { message } = req.body;
        const currentUserId = req.session.userId;

        // Create the message
        const newMsg = await Message.create({
            user_id: currentUserId,
            input: message
        });

        // Fetch the created message with user details
        const messageWithUser = await Message.findOne({
            where: { id: newMsg.id },
            include: [{
                model: User,
                attributes: ['firstName', 'lastName']
            }]
        });

        // Format the response
        const formattedMessage = {
            id: messageWithUser.id,
            username: `${messageWithUser.User.firstName} ${messageWithUser.User.lastName}`,
            message: messageWithUser.input,
            timestamp: messageWithUser.createdAt,
            isOwnedByUser: messageWithUser.user_id === currentUserId
        };

        res.json({
            added: true,
            message: formattedMessage
        });
    }
    catch (err) {
        // Use the centralized error handler
        return handleError(err, req, res);
    }
};

/**
 * Utility function to handle errors in a standardized way.
 * It checks the type of error and sends an appropriate response to the client.
 * Also, it uses flash messages to provide feedback to the user.
 *
 * @param err - The error object that was thrown.
 * @param req - The request object from the client, used to send flash messages.
 * @param res - The response object to send the error response to the client.
 * @returns {*} - The response object with the appropriate status code.
 */
function handleError(err, req, res) {
    // Handle validation errors
    if (err instanceof Sequelize.ValidationError) {
        req.flash('msg', 'Invalid input, message cannot be empty');
        return res.status(400);
    }

    // Handle database errors
    else if (err instanceof Sequelize.DatabaseError) {
        req.flash('msg', 'A database error occurred, please try again later.');
        return res.status(400);
    }

    // Handle unexpected errors
    else {
        console.error('Unexpected error:', err);
        return res.status(500);
    }
}