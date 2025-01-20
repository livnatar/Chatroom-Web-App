'use strict';
const sequelize = require('./index');
const { DataTypes } = require('sequelize');
//const Contact = require('./contact').Contact;

/**
 * this class represents an order in the database
 * it is not used in the current version of the application
 * its goal is to show you how to create a model with custom validation and associations
 * @type {ModelCtor<Model>}
 */

const Message = sequelize.define('Message', {
    user_id: DataTypes.INTEGER,
    orderDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    orderAmount: { type: DataTypes.DECIMAL, defaultValue: 1.0 },
    orderStatus: {
        type: DataTypes.ENUM('pending', 'shipped', 'delivered'),
        defaultValue: 'pending'
    },
    referenceNumber: { type: DataTypes.STRING, unique: true }
}, {
    modelName: 'Message'
});

module.exports = Message;