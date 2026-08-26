import { getSession, clearSession } from './session.js';
import { getUserById, getIssueBasic } from './db.js';
import { errorView } from './views.js';

async function requireLogin(c, next) {
  const userId = await getSession(c);
  if (!userId) return c.redirect('/login');
  const user = await getUserById(c.env.DB, Number(userId));
  if (!user) {
    clearSession(c);
    return c.redirect('/login');
  }
  c.set('currentUser', user);
  await next();
}

async function requireOwnerOrAssignee(c, next) {
  const currentUser = c.get('currentUser');
  const issue = await getIssueBasic(c.env.DB, c.req.param('id'));
  if (!issue) {
    return c.html(errorView({ message: 'Issue not found', currentUser }), 404);
  }
  if (issue.creatorId !== currentUser.id && issue.assigneeId !== currentUser.id) {
    return c.html(
      errorView({ message: 'Only the creator or assignee of this issue can do that.', currentUser }),
      403
    );
  }
  c.set('issue', issue);
  await next();
}

export { requireLogin, requireOwnerOrAssignee };
