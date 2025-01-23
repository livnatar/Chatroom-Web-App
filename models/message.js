'use strict';
const sequelize = require('./index');
const { DataTypes } = require('sequelize');



const Message = sequelize.define('Message', {
    user_id: DataTypes.INTEGER,
    input: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    modelName: 'Message'
});

module.exports = Message;