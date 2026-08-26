# ae2608b-project-tracker

A minimal Jira-like project tracker built with Node.js, Express, and a relational database (SQLite via Sequelize).

## Scope

This app deliberately covers a narrow slice, not a full Jira clone:

- **One main record type: Issue.** Users are not a record type — identity is just a name picked from a fixed list, no accounts or passwords.
- **One shared action: commenting.** Any logged-in user can add a comment to any issue.
- **One access rule:** everyone can view every issue (a transparent shared board), but only an issue's **creator** or its **assignee** can edit or delete it.

Out of scope by design: user accounts/passwords, multiple record types (projects/sprints/epics), issue history/audit log, notifications, search/filtering, and any roles beyond creator/assignee.

## Data model

- **User** — `id`, `name`. Seeded with a fixed list (Alice, Bob, Carol) on first run.
- **Issue** — `id`, `title`, `description`, `status` (`todo` / `in_progress` / `done`), `creatorId`, `assigneeId`.
- **Comment** — `id`, `body`, `issueId`, `authorId`, `createdAt`.

## Getting started

```bash
npm install
npm start        # or: npm run dev (nodemon)
```

The server listens on `http://localhost:3000` (override with the `PORT` env var). A SQLite file (`data.sqlite`) is created automatically in the project root on first run, along with the seeded users.

## Usage

1. Open `/login` and pick a name — no password required.
2. `/issues` lists every issue on the board.
3. Create an issue with `+ New Issue`; you become its creator.
4. Any logged-in user can open an issue and post a comment.
5. Only the issue's creator or assignee sees the **Edit** button and can update or delete it — anyone else gets a 403 if they try the edit/delete routes directly.

## Project layout

```
src/
  app.js            # Express app setup
  server.js         # entry point
  db/               # Sequelize models, associations, seed data
  middleware/auth.js  # requireLogin, requireOwnerOrAssignee
  routes/           # auth.js, issues.js
  views/            # EJS templates
```
