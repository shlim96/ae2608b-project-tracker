import { html } from 'hono/html';

const STYLE = html`
  <style>
    :root {
      --bg: #f5f6f8;
      --surface: #ffffff;
      --surface-2: #fafbfc;
      --border: #e3e6ea;
      --text: #1a1d21;
      --text-muted: #6b7280;
      --accent: #4f46e5;
      --accent-hover: #4338ca;
      --danger: #dc2626;
      --danger-hover: #b91c1c;
      --radius: 10px;
      --shadow: 0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 1px rgba(16, 24, 40, 0.04);
      --todo-bg: #eef0f2; --todo-fg: #4b5563;
      --progress-bg: #fef3c7; --progress-fg: #92400e;
      --done-bg: #dcfce7; --done-fg: #166534;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0f1115;
        --surface: #171a21;
        --surface-2: #1d2129;
        --border: #2a2e37;
        --text: #e6e8eb;
        --text-muted: #9aa1ac;
        --accent: #6366f1;
        --accent-hover: #818cf8;
        --danger: #ef4444;
        --danger-hover: #f87171;
        --shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        --todo-bg: #262b34; --todo-fg: #c3c8d1;
        --progress-bg: #3a2f13; --progress-fg: #facc15;
        --done-bg: #133823; --done-fg: #4ade80;
      }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--accent); }
    .page { max-width: 880px; margin: 0 auto; padding: 0 1.25rem 3rem; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.1rem 1.25rem;
      margin-bottom: 2rem;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    header .brand { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; }
    header .brand .logo {
      width: 28px; height: 28px; border-radius: 8px;
      background: linear-gradient(135deg, var(--accent), #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 0.85rem;
    }
    header h1 { font-size: 1.05rem; margin: 0; color: var(--text); font-weight: 700; }
    .whoami { display: flex; align-items: center; gap: 0.75rem; font-size: 0.88rem; color: var(--text-muted); }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 1.5rem;
      margin-bottom: 1.25rem;
    }
    .page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; gap: 1rem; }
    .page-head h2 { margin: 0; font-size: 1.4rem; font-weight: 700; }
    h2, h3 { color: var(--text); }
    h3 { font-size: 1.05rem; margin-top: 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 0.7rem 0.6rem; border-bottom: 1px solid var(--border); }
    th { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-muted); font-weight: 600; }
    tbody tr { transition: background 0.1s ease; }
    tbody tr:hover { background: var(--surface-2); }
    tbody tr:last-child td { border-bottom: none; }
    td a { color: var(--text); font-weight: 600; text-decoration: none; }
    td a:hover { color: var(--accent); }
    .status {
      display: inline-block; padding: 0.2rem 0.65rem; border-radius: 999px;
      font-size: 0.75rem; font-weight: 600; text-transform: capitalize;
    }
    .status-todo { background: var(--todo-bg); color: var(--todo-fg); }
    .status-in_progress { background: var(--progress-bg); color: var(--progress-fg); }
    .status-done { background: var(--done-bg); color: var(--done-fg); }
    form.inline { display: inline; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
      padding: 0.5rem 1rem; background: var(--accent); color: #fff; border: none;
      border-radius: 8px; cursor: pointer; text-decoration: none; font-size: 0.88rem;
      font-weight: 600; transition: background 0.15s ease;
    }
    .btn:hover { background: var(--accent-hover); }
    .btn-danger { background: var(--danger); }
    .btn-danger:hover { background: var(--danger-hover); }
    .btn-secondary { background: var(--surface-2); color: var(--text); border: 1px solid var(--border); }
    .btn-secondary:hover { background: var(--border); }
    label { display: block; margin-top: 1rem; margin-bottom: 0.3rem; font-weight: 600; font-size: 0.88rem; color: var(--text); }
    label:first-child { margin-top: 0; }
    input[type=text], textarea, select {
      width: 100%; padding: 0.55rem 0.7rem; border: 1px solid var(--border); border-radius: 8px;
      background: var(--surface-2); color: var(--text); font-size: 0.92rem; font-family: inherit;
    }
    input[type=text]:focus, textarea:focus, select:focus {
      outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }
    .error {
      color: var(--danger); background: var(--surface-2); border: 1px solid var(--danger);
      padding: 0.6rem 0.9rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem;
    }
    .meta-line { color: var(--text-muted); font-size: 0.9rem; }
    .comment { border-top: 1px solid var(--border); padding: 0.9rem 0; }
    .comment:first-child { border-top: none; padding-top: 0; }
    .comment .meta { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .empty-state { text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); }
    .form-actions { margin-top: 1.25rem; display: flex; gap: 0.6rem; align-items: center; }
  </style>
`;

function layout({ title, currentUser, body }) {
  return html`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title || 'Project Tracker'}</title>
  ${STYLE}
</head>
<body>
  <header>
    <a class="brand" href="/issues">
      <span class="logo">PT</span>
      <h1>Project Tracker</h1>
    </a>
    ${
      currentUser
        ? html`<span class="whoami">
        Signed in as <strong>${currentUser.name}</strong>
        <form class="inline" method="POST" action="/logout"><button class="btn btn-secondary" type="submit">Log out</button></form>
      </span>`
        : ''
    }
  </header>
  <div class="page">
  <main>
  ${body}
  </main>
  </div>
</body>
</html>`;
}

function loginView({ users, currentUser = null }) {
  return layout({
    title: 'Log in — Project Tracker',
    currentUser,
    body: html`
      <div class="card" style="max-width: 380px; margin: 3rem auto 0;">
        <h2 style="margin-top: 0;">Who are you?</h2>
        <form method="POST" action="/login">
          <label for="userId">Pick your name</label>
          <select name="userId" id="userId" required>
            <option value="" disabled selected>Select a name...</option>
            ${users.map((user) => html`<option value="${user.id}">${user.name}</option>`)}
          </select>
          <div class="form-actions"><button class="btn" type="submit" style="width: 100%;">Continue</button></div>
        </form>
      </div>
    `,
  });
}

function errorView({ message, currentUser = null }) {
  return layout({
    title: 'Error — Project Tracker',
    currentUser,
    body: html`
      <div class="card" style="max-width: 480px; margin: 3rem auto 0; text-align: center;">
        <h2 style="margin-top: 0;">Something went wrong</h2>
        <p class="error">${message}</p>
        <a class="btn btn-secondary" href="/issues">Back to issues</a>
      </div>
    `,
  });
}

function issuesIndexView({ issues, currentUser }) {
  return layout({
    title: 'Issues — Project Tracker',
    currentUser,
    body: html`
      <div class="page-head">
        <h2>All Issues</h2>
        <a class="btn" href="/issues/new">+ New Issue</a>
      </div>
      ${
        issues.length === 0
          ? html`<div class="card empty-state">No issues yet. Create the first one.</div>`
          : html`
            <div class="card" style="padding: 0;">
            <table>
              <thead>
                <tr><th>Title</th><th>Status</th><th>Creator</th><th>Assignee</th></tr>
              </thead>
              <tbody>
                ${issues.map(
                  (issue) => html`
                    <tr>
                      <td><a href="/issues/${issue.id}">${issue.title}</a></td>
                      <td><span class="status status-${issue.status}">${issue.status}</span></td>
                      <td>${issue.creator ? issue.creator.name : '—'}</td>
                      <td>${issue.assignee ? issue.assignee.name : '(unassigned)'}</td>
                    </tr>
                  `
                )}
              </tbody>
            </table>
            </div>
          `
      }
    `,
  });
}

function issuesNewView({ users, error, currentUser }) {
  return layout({
    title: 'New Issue — Project Tracker',
    currentUser,
    body: html`
      <h2>New Issue</h2>
      <div class="card">
      ${error ? html`<p class="error">${error}</p>` : ''}
      <form method="POST" action="/issues">
        <label for="title">Title</label>
        <input type="text" id="title" name="title" required />

        <label for="description">Description</label>
        <textarea id="description" name="description" rows="4"></textarea>

        <label for="assigneeId">Assignee</label>
        <select id="assigneeId" name="assigneeId">
          <option value="">(unassigned)</option>
          ${users.map((user) => html`<option value="${user.id}">${user.name}</option>`)}
        </select>

        <div class="form-actions"><button class="btn" type="submit">Create Issue</button></div>
      </form>
      </div>
    `,
  });
}

function issueShowView({ issue, canManage, currentUser }) {
  return layout({
    title: `${issue.title} — Project Tracker`,
    currentUser,
    body: html`
      <div class="page-head">
        <h2>${issue.title}</h2>
        ${canManage ? html`<a class="btn btn-secondary" href="/issues/${issue.id}/edit">Edit</a>` : ''}
      </div>

      <div class="card">
        <p><span class="status status-${issue.status}">${issue.status}</span></p>
        <p>${issue.description || 'No description.'}</p>
        <p class="meta-line">
          Created by <strong>${issue.creator ? issue.creator.name : '—'}</strong>
          &middot;
          Assigned to <strong>${issue.assignee ? issue.assignee.name : '(unassigned)'}</strong>
        </p>
      </div>

      <div class="card">
        <h3>Comments</h3>
        ${
          issue.comments.length === 0
            ? html`<p class="meta-line">No comments yet.</p>`
            : issue.comments.map(
                (comment) => html`
                  <div class="comment">
                    <div class="meta"><strong>${comment.author ? comment.author.name : '—'}</strong> &middot; ${new Date(comment.createdAt).toLocaleString()}</div>
                    <div>${comment.body}</div>
                  </div>
                `
              )
        }

        <form method="POST" action="/issues/${issue.id}/comments" style="margin-top: 1.25rem;">
          <label for="body">Add a comment</label>
          <textarea id="body" name="body" rows="3" required></textarea>
          <div class="form-actions"><button class="btn" type="submit">Post Comment</button></div>
        </form>
      </div>
    `,
  });
}

function issuesEditView({ issue, users, error, currentUser }) {
  return layout({
    title: 'Edit Issue — Project Tracker',
    currentUser,
    body: html`
      <h2>Edit Issue</h2>
      <div class="card">
      ${error ? html`<p class="error">${error}</p>` : ''}
      <form method="POST" action="/issues/${issue.id}">
        <label for="title">Title</label>
        <input type="text" id="title" name="title" value="${issue.title}" required />

        <label for="description">Description</label>
        <textarea id="description" name="description" rows="4">${issue.description || ''}</textarea>

        <label for="status">Status</label>
        <select id="status" name="status">
          <option value="todo" ${issue.status === 'todo' ? 'selected' : ''}>To Do</option>
          <option value="in_progress" ${issue.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
          <option value="done" ${issue.status === 'done' ? 'selected' : ''}>Done</option>
        </select>

        <label for="assigneeId">Assignee</label>
        <select id="assigneeId" name="assigneeId">
          <option value="">(unassigned)</option>
          ${users.map(
            (user) => html`<option value="${user.id}" ${issue.assigneeId === user.id ? 'selected' : ''}>${user.name}</option>`
          )}
        </select>

        <div class="form-actions">
          <button class="btn" type="submit">Save Changes</button>
        </div>
      </form>
      <form class="inline" method="POST" action="/issues/${issue.id}/delete" style="margin-top: 0.75rem;" onsubmit="return confirm('Delete this issue?');">
        <button class="btn btn-danger" type="submit">Delete Issue</button>
      </form>
      </div>
    `,
  });
}

export { loginView, errorView, issuesIndexView, issuesNewView, issueShowView, issuesEditView };
