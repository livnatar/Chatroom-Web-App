
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

        // If database is empty
        if (!maxUpdatedAt?.updatedAt && !maxDeletedAt?.deletedAt) {
            return res.json({ messages: [] });
        }

        // Get the latest timestamps
        const maxUpdatedTime = maxUpdatedAt ? new Date(maxUpdatedAt.updatedAt).getTime() : 0;
        const maxDeletedTime = maxDeletedAt ? new Date(maxDeletedAt.deletedAt).getTime() : 0;

        // Calculate the maximum timestamp
        const maxTime = Math.max(maxUpdatedTime, maxDeletedTime);

        if (maxTime >= lastUpdate.getTime()) {
            // Fetch all non-deleted messages
            const messages = await Message.findAll({
                attributes: ['id', 'user_id', 'input', 'createdAt'],
                include: {
                    model: User,
                    attributes: ['firstName', 'lastName'],
                },
                // Don't include soft-deleted messages in the results
                paranoid: true
            });

            const filteredMessages = messages.map((message) => ({
                id: message.id,
                username: `${message.User.firstName} ${message.User.lastName}`,
                message: message.input,
                timestamp: message.createdAt,
                isOwnedByUser: message.user_id === currentUserId,
            }));

            return res.json({ messages: filteredMessages });
        } else {
            return res.json({ messages: [] });
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

exports.findAndDeleteMsg = async (req, res, next) => {
    try {
        const messageId = req.body.msgId;
        // const user = await Message.findOne({
        //     where: {id: messageId},
        //     attributes:['user_id']
        // });
        //
        // // Check if message exists and if user_id matches the session userId
        // if (user && req.session.userId && user.user_id === req.session.userId) {

        // Delete the message if user_id matches
        await Message.destroy({
            where: { id: messageId }
        });

        res.json({ deleted: true });

        //
        // else {
        //     res.json({ deleted: false });
        // }
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