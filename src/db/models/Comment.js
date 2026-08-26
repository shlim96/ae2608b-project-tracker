const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

class Comment extends Model {}

Comment.init(
  {
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { sequelize, modelName: 'comment' }
);

module.exports = Comment;
