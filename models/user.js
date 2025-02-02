'use strict';
const sequelize = require('./index');
const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const {Message } = require('./message');

/**
 * User Model Definition
 *
 * Represents a user in the system with attributes such as first name, last name, email, and password.
 * Passwords are hashed before storing in the database.
 *
 */
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

/**
 * Hashes the user's password before saving it to the database.
 */
User.addHook("beforeCreate", async (user,options) => {
    user.password = await bcrypt.hash(user.password, 12);
});

/**
 * Validates the provided password against the hashed password stored in the database.
 *
 * @param password - The plain text password to validate.
 * @returns {Promise<void|*>} - Returns true if the password is correct, otherwise false.
 */
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

/**
 * Establishes a one-to-many relationship between User and Message.
 * A user can have multiple messages.
 */
User.hasMany(Message, {
    foreignKey: 'user_id'
});

/**
 * Establishes a many-to-one relationship between Message and User.
 * A message belongs to a single user.
 */
Message.belongsTo(User, {
    foreignKey: 'user_id'
});

module.exports = { User, Message };

