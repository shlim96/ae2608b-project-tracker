const app = require('./app');
const { sequelize } = require('./db/models');
const { seedUsers } = require('./db/seed');

const PORT = process.env.PORT || 3000;

async function start() {
  await sequelize.sync();
  await seedUsers();
  app.listen(PORT, () => {
    console.log(`Project tracker running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
