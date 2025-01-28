

const express = require('express');
const router = express.Router();
const {Message} = require('../models/message');
const {User} = require('../models/user');
const {checkSession} = require('../models/authorisation');
//const { Sequelize } = require('sequelize');

router.all('/', checkSession)

// router.post('/existingMessages', async (req, res) => {
//
//     let lastUpdate = new Date(req.body.lastUpdate);
//
//     try {
//         const currentUserId = req.session.userId; // Logged-in user's ID
//
//         const maxUpdatedAt = await Message.findOne({
//             attributes: ['updatedAt', 'destroyTime'],
//             order: [['updatedAt', 'DESC'], ['destroyTime', 'DESC']],
//             limit: 1,
//         });
//
//         if (maxUpdatedAt) {
//             if (new Date(maxUpdatedAt.updatedAt).getTime() >= lastUpdate.getTime() ||
//                 new Date(maxUpdatedAt.destroyTime).getTime() >= lastUpdate.getTime()) {
//                 const messages = await Message.findAll(
//                     {
//
//                         attributes: ['id', 'user_id', 'input', 'createdAt'],
//                         include: {
//                             model: User,
//                             attributes: ['firstName', 'lastName'], // Fetch firstName and lastName from User
//                         },
//                     });
//
//                 const filteredMessages = messages.map(message => ({
//                     id: message.id, // Message ID (not user ID)
//                     username: `${message.User.firstName} ${message.User.lastName}`,
//                     message: message.input,
//                     timestamp: message.createdAt,
//                     isOwnedByUser: message.user_id === currentUserId // Check ownership
//                 }));
//
//                 res.json(filteredMessages);
//             }
//         }
//         else {
//             res.json([]);
//         }
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fetch messages' });
//     }
// });

// router.post('/existingMessages', async (req, res) => {
//     const lastUpdate = new Date(req.body.lastUpdate);
//
//     try {
//         const currentUserId = req.session.userId; // Logged-in user's ID
//
//         const maxUpdatedAt = await Message.findOne({
//             attributes: ['updatedAt'],
//             order: [['updatedAt', 'DESC']],
//             limit: 1,
//         });
//
//         const maxDeletedAt = await Message.findOne({
//             attributes: ['deletedAt'],
//             order: [['deletedAt', 'DESC']],
//             limit: 1,
//         });
//         // const maxDeletedAt = await Message.findOne({
//         //     attributes: ['deletedAt'],
//         //     order: [
//         //         [Sequelize.literal('CASE WHEN `deletedAt` IS NULL THEN 1 ELSE 0 END'), 'ASC'],
//         //         ['deletedAt', 'DESC'],
//         //     ],
//         //     limit: 1,
//         // });
//
//         // database is empty - therefore null
//         if(!maxUpdatedAt?.updatedAt && !maxDeletedAt?.deletedAt){//if (!maxUpdatedAt && !maxDeletedAt) {
//             // No messages exist
//             return res.json({messages:[]});
//         }
//
//         // Get the latest timestamps from both `updatedAt` and `deletedAt`
//         const maxUpdatedTime = maxUpdatedAt ? new Date(maxUpdatedAt.updatedAt).getTime() : 0;
//         const maxDeletedTime = maxDeletedAt ? new Date(maxDeletedAt.deletedAt).getTime() : 0;
//
//         // Calculate the maximum timestamp
//         const maxTime = Math.max(maxUpdatedTime, maxDeletedTime);
//
//         // const maxTime = Math.max(
//         //     new Date(maxUpdatedAt.updatedAt).getTime(),
//         //     new Date(maxDeletedAt.deletedAt).getTime()
//         // );
//
//         if (maxTime >= lastUpdate.getTime()) {
//             const messages = await Message.findAll({
//                 attributes: ['id', 'user_id', 'input', 'createdAt'],
//                 include: {model: User, attributes: ['firstName', 'lastName'], // Fetch firstName and lastName from User
//                 },
//             });
//
//             const filteredMessages = messages.map((message) => ({
//                 id: message.id, // Message ID (not user ID)
//                 username: `${message.User.firstName} ${message.User.lastName}`,
//                 message: message.input,
//                 timestamp: message.createdAt,
//                 isOwnedByUser: message.user_id === currentUserId, // Check ownership
//             }));
//
//             return res.json({messages:filteredMessages});
//         }
//         else {
//             // No new messages - no need to fetch messages
//             return res.json({messages:[]});
//         }
//     }
//     catch (error) {
//         console.error('Error fetching messages:', error);
//         res.status(500).json({ error: 'Failed to fetch messages' });
//     }
// });

router.post('/existingMessages', async (req, res) => {
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
});


router.post('/check-session', (res) => {
    return res.status(200);
});

router.post('/find-and-delete-msg', async (req, res) => {
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
});

// router.post('/save-msg', async (req, res) => {
//     try{
//         const messageId = req.body.msgId;
//         const newMsg = req.body.newInput;
//
//         const message = await Message.findOne({
//             where: {id: messageId},
//             attributes:['user_id', 'input']
//         });
//
//         // Check if message exists and if user_id matches the session userId
//         if (message && req.session.userId && message.user_id === req.session.userId) {
//
//             // Delete the message if user_id matches
//             await Message.update(
//                 { input: newMsg },
//                 { where: { id: messageId } }
//             );
//
//             res.json({ updated: true, newInput: newMsg });
//         }
//         else {
//             res.json({ updated: false });
//         }
//     } catch (error) {
//         console.error('Error updating message:', error);
//         return res.status(500).json({ authenticated: false });
//     }
// });

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
});

// async function verifyMessageOwner(messageId, userId) {
//     const message = await Message.findOne({
//         where: { id: messageId },
//         attributes: ['user_id'],
//     });
//     return message && message.user_id === userId;
// }

module.exports = router;