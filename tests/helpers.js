const request = require('supertest');
const app = require('../src/app');
const { sequelize, User } = require('../src/db/models');
const { seedUsers, SEED_NAMES } = require('../src/db/seed');

async function resetDb() {
  await sequelize.sync({ force: true });
  await seedUsers();
}

async function getSeededUsers() {
  const users = await User.findAll({ order: [['name', 'ASC']] });
  return users;
}

async function loginAs(userId) {
  const agent = request.agent(app);
  await agent.post('/login').type('form').send({ userId });
  return agent;
}

module.exports = { app, resetDb, getSeededUsers, loginAs, SEED_NAMES, sequelize };
