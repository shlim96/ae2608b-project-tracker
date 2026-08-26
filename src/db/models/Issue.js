const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

class Issue extends Model {}

Issue.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'done'),
      allowNull: false,
      defaultValue: 'todo',
    },
  },
  { sequelize, modelName: 'issue' }
);

module.exports = Issue;
