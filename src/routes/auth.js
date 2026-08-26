const express = require('express');
const { User } = require('../db/models');

const router = express.Router();

router.get('/login', async (req, res) => {
  const users = await User.findAll({ order: [['name', 'ASC']] });
  res.render('login', { users, currentUser: null });
});

router.post('/login', async (req, res) => {
  const user = await User.findByPk(req.body.userId);
  if (!user) {
    return res.redirect('/login');
  }
  req.session.userId = user.id;
  res.redirect('/issues');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
