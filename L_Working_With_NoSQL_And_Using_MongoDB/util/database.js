const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'cr00ked29', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;
