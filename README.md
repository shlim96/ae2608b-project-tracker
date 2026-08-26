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

worker/             # Cloudflare Workers port (Hono + D1) of the same app
  index.js          # Worker entry point / routes
  session.js        # signed-cookie session handling
  db.js             # D1 queries
  views.js          # HTML views
  middleware.js     # requireLogin, requireOwnerOrAssignee

migrations/         # D1 (SQLite) schema migrations for the worker
```

## Deploying to Cloudflare

The `worker/` directory is a second implementation of this app that runs on Cloudflare Workers with D1 instead of Express/SQLite. It uses the `worker:*` npm scripts and `wrangler.jsonc`.

1. **Create your own D1 database** (the `database_id` in `wrangler.jsonc` belongs to the original author's account and won't work for you):

   ```bash
   npx wrangler d1 create ae2608b-project-tracker
   ```

   Copy the `database_id` from the output into `wrangler.jsonc`.

2. **Run migrations** — the worker will 500 with `no such table: users` until this is done:

   ```bash
   npm run worker:migrate:local    # for local `wrangler dev`
   npm run worker:migrate:remote   # for the deployed worker
   ```

3. **Set `SESSION_SECRET`** — `worker/session.js` signs the session cookie with it; without it, `/login` returns a 500.

   - Local dev: copy `.dev.vars.example` to `.dev.vars` (gitignored) and set a real value:

     ```bash
     cp .dev.vars.example .dev.vars
     ```

   - Deployed worker:

     ```bash
     npx wrangler secret put SESSION_SECRET
     ```

4. **Run or deploy:**

   ```bash
   npm run worker:dev      # local dev server via wrangler
   npm run worker:deploy   # deploy to Cloudflare
   ```
