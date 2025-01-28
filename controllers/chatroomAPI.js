
const {Message} = require('../models/message');
const {User} = require('../models/user');

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

exports.saveMsg = async (req, res, next) => {
    try{
        const messageId = req.body.msgId;
        const newMsg = req.body.newInput;

        const message = await Message.findOne({
            where: {id: messageId},
            attributes:['user_id', 'input']
        });

        // Check if message exists and if user_id matches the session userId
        if (message && req.session.userId && message.user_id === req.session.userId) {
            // Update the message if user_id matches
            await Message.update(
                { input: newMsg },
                { where: { id: messageId } }
            );

            res.json({ updated: true, newInput: newMsg });
        }
        else {
            res.json({ updated: false });
        }
    } catch (error) {
        console.error('Error updating message:', error);
        return res.status(500).json({ authenticated: false });
    }
};