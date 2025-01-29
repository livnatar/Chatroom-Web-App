'use strict';
const sequelize = require('./index');
const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const {Message } = require('./message');

const User = sequelize.define('User', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAlpha: true,
            len:[3,32],
            notEmpty: true
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAlpha: true,
            len:[3,32],
            notEmpty: true
        }
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len:[3,32],
            notEmpty: true
        }
    }
}, {
    modelName: 'User',
});

User.addHook("beforeCreate", async (user,options) => {
    user.password = await bcrypt.hash(user.password, 12);
});

User.hasMany(Message, {
    foreignKey: 'user_id'
});

Message.belongsTo(User, {
    foreignKey: 'user_id'
});

module.exports = { User, Message };



// const validation = require("../models/validation");
//
// let userList = [];
//
// function findIfEmailExists(emailAddress) {
//     return userList.some(user => user.email === emailAddress);
// }
//
// function findUserByEmail(emailAddress) {
//     return userList.find(user => user.email === emailAddress);
// }
//
// class User {
//     constructor(email,password,firstName,lastName, id) {
//         this.email = email;
//         this.password = password;
//         this.firstName = firstName;
//         this.lastName = lastName;
//         this.id = id;
//     }
//
//     addUser() {
//
//         // check if the email exist in the userList
//         // we get here if throughout the registration process the email has been already taken
//         if(findIfEmailExists(this.email)) {
//             throw new Error("Email already exists, please try a different email");
//         }
//
//         //check validation for each field and throw error
//         else if(validation.nameValidation(this.firstName) &&
//                 validation.nameValidation(this.lastName)  &&
//                 validation.validatePassword(this.password) &&
//                 validation.emailValidation(this.email)){
//
//             userList.push(this);
//         }
//         else {
//            throw new Error("Invalid input")
//         }
//     }
//
//     checkIfEqualsToPassword(password) {
//         return this.password === password;
//     }
//
//     static fetchAll() {
//         return userList;
//     }
//
//     static getLength() {
//         return userList.length;
//     }
//
// }
//
// module.exports = {User, findUserByEmail, findIfEmailExists};