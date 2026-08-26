const request = require('supertest');
const { app, resetDb, getSeededUsers, sequelize } = require('./helpers');

describe('auth', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('GET /login lists seeded users', async () => {
    const res = await request(app).get('/login');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Alice');
    expect(res.text).toContain('Bob');
    expect(res.text).toContain('Carol');
  });

  test('GET / redirects to /issues', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/issues');
  });

  test('GET /issues without a session redirects to /login', async () => {
    const res = await request(app).get('/issues');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  test('POST /login with a valid userId establishes a session and redirects to /issues', async () => {
    const [alice] = await getSeededUsers();
    const agent = request.agent(app);

    const loginRes = await agent.post('/login').type('form').send({ userId: alice.id });
    expect(loginRes.status).toBe(302);
    expect(loginRes.headers.location).toBe('/issues');

    const issuesRes = await agent.get('/issues');
    expect(issuesRes.status).toBe(200);
  });

  test('POST /login with an unknown userId redirects back to /login without a session', async () => {
    const agent = request.agent(app);
    const res = await agent.post('/login').type('form').send({ userId: 999999 });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');

    const issuesRes = await agent.get('/issues');
    expect(issuesRes.status).toBe(302);
    expect(issuesRes.headers.location).toBe('/login');
  });

  test('POST /logout destroys the session', async () => {
    const [alice] = await getSeededUsers();
    const agent = request.agent(app);
    await agent.post('/login').type('form').send({ userId: alice.id });

    const logoutRes = await agent.post('/logout');
    expect(logoutRes.status).toBe(302);
    expect(logoutRes.headers.location).toBe('/login');

    const issuesRes = await agent.get('/issues');
    expect(issuesRes.status).toBe(302);
    expect(issuesRes.headers.location).toBe('/login');
  });
});
