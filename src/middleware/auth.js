const { User, Issue } = require('../db/models');
const asyncHandler = require('./asyncHandler');

const requireLogin = asyncHandler(async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  const user = await User.findByPk(req.session.userId);
  if (!user) {
    req.session.userId = null;
    return res.redirect('/login');
  }
  req.currentUser = user;
  res.locals.currentUser = user;
  next();
});

const requireOwnerOrAssignee = asyncHandler(async (req, res, next) => {
  const issue = await Issue.findByPk(req.params.id);
  if (!issue) {
    return res.status(404).render('error', { message: 'Issue not found', currentUser: req.currentUser });
  }
  const userId = req.currentUser.id;
  if (issue.creatorId !== userId && issue.assigneeId !== userId) {
    return res.status(403).render('error', {
      message: 'Only the creator or assignee of this issue can do that.',
      currentUser: req.currentUser,
    });
  }
  req.issue = issue;
  next();
});

module.exports = { requireLogin, requireOwnerOrAssignee };
