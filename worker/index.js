import { Hono } from 'hono';
import { setSession, clearSession } from './session.js';
import {
  getUsers,
  getUserById,
  getIssues,
  getIssueWithDetails,
  createIssue,
  updateIssue,
  deleteIssue,
  createComment,
} from './db.js';
import { loginView, errorView, issuesIndexView, issuesNewView, issueShowView, issuesEditView } from './views.js';
import { requireLogin, requireOwnerOrAssignee } from './middleware.js';

const ISSUE_STATUSES = ['todo', 'in_progress', 'done'];

const auth = new Hono();

auth.get('/login', async (c) => {
  const users = await getUsers(c.env.DB);
  return c.html(loginView({ users, currentUser: null }));
});

auth.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const user = await getUserById(c.env.DB, Number(body.userId));
  if (!user) return c.redirect('/login');
  await setSession(c, user.id);
  return c.redirect('/issues');
});

auth.post('/logout', (c) => {
  clearSession(c);
  return c.redirect('/login');
});

const issues = new Hono();
issues.use('*', requireLogin);

issues.get('/', async (c) => {
  const currentUser = c.get('currentUser');
  const list = await getIssues(c.env.DB);
  return c.html(issuesIndexView({ issues: list, currentUser }));
});

issues.get('/new', async (c) => {
  const currentUser = c.get('currentUser');
  const users = await getUsers(c.env.DB);
  return c.html(issuesNewView({ users, currentUser }));
});

issues.post('/', async (c) => {
  const currentUser = c.get('currentUser');
  const body = await c.req.parseBody();
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) {
    const users = await getUsers(c.env.DB);
    return c.html(issuesNewView({ users, currentUser, error: 'Title is required.' }), 400);
  }
  const id = await createIssue(c.env.DB, {
    title,
    description: body.description ? String(body.description).trim() : null,
    creatorId: currentUser.id,
    assigneeId: body.assigneeId ? Number(body.assigneeId) : null,
  });
  return c.redirect(`/issues/${id}`);
});

issues.get('/:id', async (c) => {
  const currentUser = c.get('currentUser');
  const issue = await getIssueWithDetails(c.env.DB, c.req.param('id'));
  if (!issue) {
    return c.html(errorView({ message: 'Issue not found', currentUser }), 404);
  }
  const canManage = issue.creatorId === currentUser.id || issue.assigneeId === currentUser.id;
  return c.html(issueShowView({ issue, canManage, currentUser }));
});

issues.get('/:id/edit', requireOwnerOrAssignee, async (c) => {
  const currentUser = c.get('currentUser');
  const users = await getUsers(c.env.DB);
  return c.html(issuesEditView({ issue: c.get('issue'), users, currentUser }));
});

issues.post('/:id', requireOwnerOrAssignee, async (c) => {
  const currentUser = c.get('currentUser');
  const issue = c.get('issue');
  const body = await c.req.parseBody();
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const users = await getUsers(c.env.DB);
  if (!title) {
    return c.html(issuesEditView({ issue, users, currentUser, error: 'Title is required.' }), 400);
  }
  if (!ISSUE_STATUSES.includes(body.status)) {
    return c.html(issuesEditView({ issue, users, currentUser, error: 'Invalid status.' }), 400);
  }
  const assigneeId = body.assigneeId ? Number(body.assigneeId) : null;
  if (assigneeId !== null && !users.some((u) => u.id === assigneeId)) {
    return c.html(issuesEditView({ issue, users, currentUser, error: 'Invalid assignee.' }), 400);
  }
  await updateIssue(c.env.DB, issue.id, {
    title,
    description: body.description ? String(body.description).trim() : null,
    status: body.status,
    assigneeId,
  });
  return c.redirect(`/issues/${issue.id}`);
});

issues.post('/:id/delete', requireOwnerOrAssignee, async (c) => {
  const issue = c.get('issue');
  await deleteIssue(c.env.DB, issue.id);
  return c.redirect('/issues');
});

issues.post('/:id/comments', async (c) => {
  const currentUser = c.get('currentUser');
  const id = c.req.param('id');
  const issue = await getIssueWithDetails(c.env.DB, id);
  if (!issue) {
    return c.html(errorView({ message: 'Issue not found', currentUser }), 404);
  }
  const body = await c.req.parseBody();
  const text = typeof body.body === 'string' ? body.body.trim() : '';
  if (text) {
    await createComment(c.env.DB, { body: text, issueId: issue.id, authorId: currentUser.id });
  }
  return c.redirect(`/issues/${issue.id}`);
});

const app = new Hono();

app.use('*', async (c, next) => {
  if (!c.env.SESSION_SECRET) {
    return c.html(
      errorView({
        message: 'Server misconfigured: SESSION_SECRET is not set. See README for setup.',
        currentUser: null,
      }),
      500
    );
  }
  return next();
});

app.get('/', (c) => c.redirect('/issues'));
app.route('/', auth);
app.route('/issues', issues);

app.notFound((c) => c.html(errorView({ message: 'Page not found', currentUser: c.get('currentUser') ?? null }), 404));

app.onError((err, c) => {
  console.error(err);
  return c.html(errorView({ message: 'Something went wrong', currentUser: c.get('currentUser') ?? null }), 500);
});

export default app;
