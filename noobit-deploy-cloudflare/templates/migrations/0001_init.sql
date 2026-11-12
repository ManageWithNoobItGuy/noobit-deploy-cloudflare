-- Migration 0001: first tables
-- Apply to the LIVE database with:
--   npx wrangler d1 migrations apply DB --remote
CREATE TABLE IF NOT EXISTS items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  text       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
