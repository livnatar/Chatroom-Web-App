

const express = require('express');
const router = express.Router();
const {Message } = require('../models/message');
const {User } = require('../models/user');


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
            isOwnedByUser: message.userId === currentUserId // Check ownership
        }));

        res.json(filteredMessages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
