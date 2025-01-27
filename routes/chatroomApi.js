

const express = require('express');
const router = express.Router();
const {Message} = require('../models/message');
const {User} = require('../models/user');


router.get('/existingMessages', async (req, res) => {

    try {
        const currentUserId = req.session.userId; // Logged-in user's ID
        const messages = await Message.findAll({
            attributes: ['id', 'user_id', 'input', 'createdAt'],
            include: {
                model: User,
                attributes: ['firstName', 'lastName'], // Fetch firstName and lastName from User
            },
        });

        const filteredMessages = messages.map(message => ({
            id: message.id, // Message ID (not user ID)
            username: `${message.User.firstName} ${message.User.lastName}`,
            message: message.input,
            timestamp: message.createdAt,
            isOwnedByUser: message.user_id === currentUserId // Check ownership
        }));

        res.json(filteredMessages);

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

router.post('/check-session', async (req, res) => {

    try {
        const messageId = req.body.msgId;
        const message = await Message.findOne({
            where: { id: messageId },
            attributes: ['user_id']
        });

        // If message is found and its user_id matches the session userId
        if (message && req.session.userId && message.user_id === req.session.userId) {
            res.json({ authenticated: true });
        } else {
            res.json({ authenticated: false });
        }
    } catch (error) {
        console.error('Error checking session:', error);
        return res.status(500).json({ authenticated: false });
    }
});

router.post('/find-and-delete-msg', async (req, res) => {
    try{
        const messageId = req.body.msgId;
        const user = await Message.findOne({
            where: {id: messageId},
            attributes:['user_id']
        });

        // Check if message exists and if user_id matches the session userId
        if (user && req.session.userId && user.user_id === req.session.userId) {

            // Delete the message if user_id matches
            await Message.destroy({
                where: { id: messageId }
            });

            res.json({ deleted: true });
        }
        else {
            res.json({ deleted: false });
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        return res.status(500).json({ authenticated: false });
    }
});

router.post('/save-msg', async (req, res) => {
    try{
        const messageId = req.body.msgId;
        const newMsg = req.body.newInput;

        const message = await Message.findOne({
            where: {id: messageId},
            attributes:['user_id', 'input']
        });

        // Check if message exists and if user_id matches the session userId
        if (message && req.session.userId && message.user_id === req.session.userId) {

            // Delete the message if user_id matches
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
});


async function verifyMessageOwner(messageId, userId) {
    const message = await Message.findOne({
        where: { id: messageId },
        attributes: ['user_id'],
    });
    return message && message.user_id === userId;
}

module.exports = router;