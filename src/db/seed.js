const { User } = require('./models');

const SEED_NAMES = ['Alice', 'Bob', 'Carol'];

async function seedUsers() {
  const count = await User.count();
  if (count > 0) return;
  await User.bulkCreate(SEED_NAMES.map((name) => ({ name })));
}

module.exports = { seedUsers, SEED_NAMES };
