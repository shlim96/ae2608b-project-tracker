const sequelize = require('../sequelize');
const User = require('./User');
const Issue = require('./Issue');
const Comment = require('./Comment');

User.hasMany(Issue, { foreignKey: 'creatorId', as: 'createdIssues' });
Issue.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

User.hasMany(Issue, { foreignKey: 'assigneeId', as: 'assignedIssues' });
Issue.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

Issue.hasMany(Comment, { foreignKey: { name: 'issueId', allowNull: false }, as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Issue, { foreignKey: { name: 'issueId', allowNull: false }, onDelete: 'CASCADE' });

User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

module.exports = { sequelize, User, Issue, Comment };
