const path = require('path');
const express = require('express');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const issuesRoutes = require('./routes/issues');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-project-tracker',
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = null;
  next();
});

app.get('/', (req, res) => res.redirect('/issues'));

app.use('/', authRoutes);
app.use('/issues', issuesRoutes);

app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found', currentUser: req.currentUser || null });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { message: 'Something went wrong', currentUser: req.currentUser || null });
});

module.exports = app;
