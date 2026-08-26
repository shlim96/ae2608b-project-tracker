function mapIssueRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    creatorId: row.creatorId,
    assigneeId: row.assigneeId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    creator: row.creator_id ? { id: row.creator_id, name: row.creator_name } : null,
    assignee: row.assignee_id ? { id: row.assignee_id, name: row.assignee_name } : null,
  };
}

async function getUsers(db) {
  const { results } = await db.prepare('SELECT * FROM users ORDER BY name ASC').all();
  return results;
}

async function getUserById(db, id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
}

async function getIssues(db) {
  const { results } = await db
    .prepare(
      `SELECT i.*, c.id as creator_id, c.name as creator_name, a.id as assignee_id, a.name as assignee_name
       FROM issues i
       LEFT JOIN users c ON i.creatorId = c.id
       LEFT JOIN users a ON i.assigneeId = a.id
       ORDER BY i.createdAt DESC`
    )
    .all();
  return results.map(mapIssueRow);
}

async function getIssueBasic(db, id) {
  return db.prepare('SELECT * FROM issues WHERE id = ?').bind(id).first();
}

async function getIssueWithDetails(db, id) {
  const row = await db
    .prepare(
      `SELECT i.*, c.id as creator_id, c.name as creator_name, a.id as assignee_id, a.name as assignee_name
       FROM issues i
       LEFT JOIN users c ON i.creatorId = c.id
       LEFT JOIN users a ON i.assigneeId = a.id
       WHERE i.id = ?`
    )
    .bind(id)
    .first();
  if (!row) return null;

  const issue = mapIssueRow(row);
  const { results: commentRows } = await db
    .prepare(
      `SELECT cm.*, u.id as author_id, u.name as author_name
       FROM comments cm
       LEFT JOIN users u ON cm.authorId = u.id
       WHERE cm.issueId = ?
       ORDER BY cm.createdAt ASC`
    )
    .bind(id)
    .all();
  issue.comments = commentRows.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.createdAt,
    author: r.author_id ? { id: r.author_id, name: r.author_name } : null,
  }));
  return issue;
}

async function createIssue(db, { title, description, creatorId, assigneeId }) {
  const now = new Date().toISOString();
  const res = await db
    .prepare(
      'INSERT INTO issues (title, description, status, creatorId, assigneeId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(title, description, 'todo', creatorId, assigneeId, now, now)
    .run();
  return res.meta.last_row_id;
}

async function updateIssue(db, id, { title, description, status, assigneeId }) {
  const now = new Date().toISOString();
  await db
    .prepare('UPDATE issues SET title = ?, description = ?, status = ?, assigneeId = ?, updatedAt = ? WHERE id = ?')
    .bind(title, description, status, assigneeId, now, id)
    .run();
}

async function deleteIssue(db, id) {
  await db.prepare('DELETE FROM issues WHERE id = ?').bind(id).run();
}

async function createComment(db, { body, issueId, authorId }) {
  const now = new Date().toISOString();
  await db
    .prepare('INSERT INTO comments (body, issueId, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)')
    .bind(body, issueId, authorId, now, now)
    .run();
}

export {
  getUsers,
  getUserById,
  getIssues,
  getIssueBasic,
  getIssueWithDetails,
  createIssue,
  updateIssue,
  deleteIssue,
  createComment,
};
