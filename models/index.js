// models/index.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite3' // this is the file where the data is stored
});


module.exports = sequelize;