'use strict';
const sequelize = require('./index');
const { DataTypes } = require('sequelize');

/**
 * Message Model Definition
 *
 * Represents a chat message in the system, linked to a user via `user_id`.
 * Messages are stored with `input` content and support soft deletion (`paranoid: true`).
 *
 */
const Message = sequelize.define('Message',
    {
    user_id: DataTypes.INTEGER,
    input: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
    },
    {
    sequelize,
    paranoid: true },
    {
    modelName: 'Message'
    });


module.exports = {Message} ;