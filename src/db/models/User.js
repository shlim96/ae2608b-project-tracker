const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

class User extends Model {}

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { sequelize, modelName: 'user' }
);

module.exports = User;
