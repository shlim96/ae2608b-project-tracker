const crypto = require('crypto');

// The real `uuid` package (v14) ships ESM-only, which Jest's CommonJS
// transform can't load. Sequelize only uses `uuid.v4()` internally, so a
// thin CommonJS stand-in is enough for tests.
module.exports = { v4: () => crypto.randomUUID() };
