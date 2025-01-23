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
// const Message = sequelize.define('Message', {
//     // Keep existing fields
//     user_id: {
//         type: DataTypes.INTEGER,
//         references: {
//             model: 'Users', // Name of the referenced table
//             key: 'id'
//         }
//     },
//     input: {
//         type: DataTypes.STRING,
//         allowNull: false
//     }
// }, {
//     modelName:'Message'
// });

module.exports = {Message} ;