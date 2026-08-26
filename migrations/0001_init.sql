CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  creatorId INTEGER REFERENCES users(id),
  assigneeId INTEGER REFERENCES users(id),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  body TEXT NOT NULL,
  issueId INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  authorId INTEGER REFERENCES users(id),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
