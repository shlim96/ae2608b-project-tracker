const express = require('express');
const { User, Issue, Comment } = require('../db/models');
const { requireLogin, requireOwnerOrAssignee } = require('../middleware/auth');

const router = express.Router();

router.use(requireLogin);

router.get('/', async (req, res) => {
  const issues = await Issue.findAll({
    include: [
      { model: User, as: 'creator' },
      { model: User, as: 'assignee' },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.render('issues/index', { issues });
});

router.get('/new', async (req, res) => {
  const users = await User.findAll({ order: [['name', 'ASC']] });
  res.render('issues/new', { users });
});

router.post('/', async (req, res) => {
  const { title, description, assigneeId } = req.body;
  if (!title || !title.trim()) {
    const users = await User.findAll({ order: [['name', 'ASC']] });
    return res.status(400).render('issues/new', { users, error: 'Title is required.' });
  }
  const issue = await Issue.create({
    title: title.trim(),
    description: description ? description.trim() : null,
    creatorId: req.currentUser.id,
    assigneeId: assigneeId || null,
  });
  res.redirect(`/issues/${issue.id}`);
});

router.get('/:id', async (req, res) => {
  const issue = await Issue.findByPk(req.params.id, {
    include: [
      { model: User, as: 'creator' },
      { model: User, as: 'assignee' },
      { model: Comment, as: 'comments', include: [{ model: User, as: 'author' }], separate: true, order: [['createdAt', 'ASC']] },
    ],
  });
  if (!issue) {
    return res.status(404).render('error', { message: 'Issue not found' });
  }
  const canManage = issue.creatorId === req.currentUser.id || issue.assigneeId === req.currentUser.id;
  res.render('issues/show', { issue, canManage });
});

router.get('/:id/edit', requireOwnerOrAssignee, async (req, res) => {
  const users = await User.findAll({ order: [['name', 'ASC']] });
  res.render('issues/edit', { issue: req.issue, users });
});

router.post('/:id', requireOwnerOrAssignee, async (req, res) => {
  const { title, description, status, assigneeId } = req.body;
  if (!title || !title.trim()) {
    const users = await User.findAll({ order: [['name', 'ASC']] });
    return res.status(400).render('issues/edit', { issue: req.issue, users, error: 'Title is required.' });
  }
  await req.issue.update({
    title: title.trim(),
    description: description ? description.trim() : null,
    status,
    assigneeId: assigneeId || null,
  });
  res.redirect(`/issues/${req.issue.id}`);
});

router.post('/:id/delete', requireOwnerOrAssignee, async (req, res) => {
  await req.issue.destroy();
  res.redirect('/issues');
});

router.post('/:id/comments', async (req, res) => {
  const issue = await Issue.findByPk(req.params.id);
  if (!issue) {
    return res.status(404).render('error', { message: 'Issue not found' });
  }
  const { body } = req.body;
  if (body && body.trim()) {
    await Comment.create({
      body: body.trim(),
      issueId: issue.id,
      authorId: req.currentUser.id,
    });
  }
  res.redirect(`/issues/${issue.id}`);
});

module.exports = router;
