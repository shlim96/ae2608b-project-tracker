const path = require('path');
const { Sequelize } = require('sequelize');

const storage = process.env.DB_STORAGE || path.join(__dirname, '..', '..', 'data.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});

module.exports = sequelize;
