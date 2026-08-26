const request = require('supertest');
const { app, resetDb, getSeededUsers, loginAs, sequelize } = require('./helpers');
const { Issue } = require('../src/db/models');

describe('issues', () => {
  let alice;
  let bob;
  let carol;

  beforeEach(async () => {
    await resetDb();
    [alice, bob, carol] = await getSeededUsers();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('creating an issue', () => {
    test('a logged-in user can create an issue and becomes its creator', async () => {
      const agent = await loginAs(alice.id);

      const res = await agent
        .post('/issues')
        .type('form')
        .send({ title: 'Fix the bug', description: 'It is broken', assigneeId: bob.id });

      expect(res.status).toBe(302);
      expect(res.headers.location).toMatch(/^\/issues\/\d+$/);

      const issue = await Issue.findOne({ where: { title: 'Fix the bug' } });
      expect(issue).not.toBeNull();
      expect(issue.creatorId).toBe(alice.id);
      expect(issue.assigneeId).toBe(bob.id);
      expect(issue.status).toBe('todo');
    });

    test('rejects an empty title with a 400', async () => {
      const agent = await loginAs(alice.id);

      const res = await agent.post('/issues').type('form').send({ title: '   ' });

      expect(res.status).toBe(400);
      expect(res.text).toContain('Title is required.');
      const count = await Issue.count();
      expect(count).toBe(0);
    });

    test('requires login', async () => {
      const res = await request(app).post('/issues').type('form').send({ title: 'Nope' });
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/login');
    });
  });

  describe('listing and viewing', () => {
    test('GET /issues shows issues created by any user', async () => {
      const created = await Issue.create({ title: 'Shared issue', creatorId: bob.id });
      const agent = await loginAs(alice.id);

      const res = await agent.get('/issues');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Shared issue');
      expect(res.text).toContain(String(created.id));
    });

    test('GET /issues/:id 404s for a missing issue', async () => {
      const agent = await loginAs(alice.id);
      const res = await agent.get('/issues/999999');
      expect(res.status).toBe(404);
    });
  });

  describe('access control on edit/delete', () => {
    let issue;

    beforeEach(async () => {
      issue = await Issue.create({ title: 'Owned by alice', creatorId: alice.id, assigneeId: bob.id });
    });

    test('the creator can view the edit page', async () => {
      const agent = await loginAs(alice.id);
      const res = await agent.get(`/issues/${issue.id}/edit`);
      expect(res.status).toBe(200);
    });

    test('the assignee can view the edit page', async () => {
      const agent = await loginAs(bob.id);
      const res = await agent.get(`/issues/${issue.id}/edit`);
      expect(res.status).toBe(200);
    });

    test('an unrelated user gets a 403 on the edit page', async () => {
      const agent = await loginAs(carol.id);
      const res = await agent.get(`/issues/${issue.id}/edit`);
      expect(res.status).toBe(403);
    });

    test('an unrelated user gets a 403 posting an update', async () => {
      const agent = await loginAs(carol.id);
      const res = await agent
        .post(`/issues/${issue.id}`)
        .type('form')
        .send({ title: 'Hijacked', status: 'done' });
      expect(res.status).toBe(403);

      await issue.reload();
      expect(issue.title).toBe('Owned by alice');
    });

    test('an unrelated user gets a 403 deleting the issue', async () => {
      const agent = await loginAs(carol.id);
      const res = await agent.post(`/issues/${issue.id}/delete`);
      expect(res.status).toBe(403);

      const stillExists = await Issue.findByPk(issue.id);
      expect(stillExists).not.toBeNull();
    });

    test('the creator can update the issue', async () => {
      const agent = await loginAs(alice.id);
      const res = await agent
        .post(`/issues/${issue.id}`)
        .type('form')
        .send({ title: 'Updated title', status: 'in_progress', assigneeId: bob.id });

      expect(res.status).toBe(302);
      await issue.reload();
      expect(issue.title).toBe('Updated title');
      expect(issue.status).toBe('in_progress');
    });

    test('update rejects an invalid status', async () => {
      const agent = await loginAs(alice.id);
      const res = await agent
        .post(`/issues/${issue.id}`)
        .type('form')
        .send({ title: 'Updated title', status: 'not_a_status' });

      expect(res.status).toBe(400);
      expect(res.text).toContain('Invalid status.');
    });

    test('update rejects an unknown assignee', async () => {
      const agent = await loginAs(alice.id);
      const res = await agent
        .post(`/issues/${issue.id}`)
        .type('form')
        .send({ title: 'Updated title', status: 'todo', assigneeId: 999999 });

      expect(res.status).toBe(400);
      expect(res.text).toContain('Invalid assignee.');
    });

    test('the assignee can delete the issue', async () => {
      const agent = await loginAs(bob.id);
      const res = await agent.post(`/issues/${issue.id}/delete`);

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/issues');
      const deleted = await Issue.findByPk(issue.id);
      expect(deleted).toBeNull();
    });
  });

  describe('comments', () => {
    let issue;

    beforeEach(async () => {
      issue = await Issue.create({ title: 'Discuss me', creatorId: alice.id });
    });

    test('any logged-in user can comment on any issue', async () => {
      const agent = await loginAs(carol.id);
      const res = await agent.post(`/issues/${issue.id}/comments`).type('form').send({ body: 'Looks good' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(`/issues/${issue.id}`);

      const showRes = await agent.get(`/issues/${issue.id}`);
      expect(showRes.text).toContain('Looks good');
      expect(showRes.text).toContain('Carol');
    });

    test('an empty comment body is silently ignored', async () => {
      const agent = await loginAs(carol.id);
      const res = await agent.post(`/issues/${issue.id}/comments`).type('form').send({ body: '   ' });

      expect(res.status).toBe(302);
      const { Comment } = require('../src/db/models');
      const count = await Comment.count({ where: { issueId: issue.id } });
      expect(count).toBe(0);
    });

    test('commenting on a missing issue 404s', async () => {
      const agent = await loginAs(carol.id);
      const res = await agent.post('/issues/999999/comments').type('form').send({ body: 'hi' });
      expect(res.status).toBe(404);
    });
  });
});
