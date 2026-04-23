import { turso } from "./client";

let isDbInitialized = false;

/**
 * Runs CREATE TABLE IF NOT EXISTS for all teamspace tables.
 * Safe to call on every cold start — idempotent.
 * Optimized to only run once per server instance lifecycle.
 */
export async function initTeamspaceDB() {
  if (isDbInitialized) return;

  // 1. Ensure migrations are applied (e.g. adding columns to existing tables)
  try {
    await turso.execute("ALTER TABLE ts_messages ADD COLUMN link_preview TEXT;");
  } catch (e) {
    // Column likely already exists
  }

  await turso.executeMultiple(`
    CREATE TABLE IF NOT EXISTS ts_channels (
      id          TEXT PRIMARY KEY,
      project_id  TEXT NOT NULL,
      name        TEXT NOT NULL,
      description TEXT,
      type        TEXT NOT NULL DEFAULT 'text',
      is_default  INTEGER NOT NULL DEFAULT 0,
      created_by  TEXT NOT NULL,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_channels_project ON ts_channels(project_id);

    CREATE TABLE IF NOT EXISTS ts_messages (
      id               TEXT PRIMARY KEY,
      channel_id       TEXT NOT NULL,
      project_id       TEXT NOT NULL,
      user_id          TEXT NOT NULL,
      user_name        TEXT NOT NULL,
      user_image       TEXT,
      content          TEXT NOT NULL,
      link_preview     TEXT, -- JSON metadata for unfurled links
      thread_parent_id TEXT,
      is_pinned        INTEGER NOT NULL DEFAULT 0,
      edited_at        INTEGER,
      created_at       INTEGER NOT NULL,
      FOREIGN KEY (channel_id) REFERENCES ts_channels(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_messages_channel ON ts_messages(channel_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_thread  ON ts_messages(thread_parent_id);

    -- Full-Text Search Table
    CREATE VIRTUAL TABLE IF NOT EXISTS ts_messages_fts USING fts5(
      message_id,
      project_id,
      content,
      tokenize='porter'
    );

    -- Sync Triggers for Search
    CREATE TRIGGER IF NOT EXISTS ts_messages_ai AFTER INSERT ON ts_messages BEGIN
      INSERT INTO ts_messages_fts(message_id, project_id, content)
      VALUES (new.id, new.project_id, new.content);
    END;

    CREATE TRIGGER IF NOT EXISTS ts_messages_ad AFTER DELETE ON ts_messages BEGIN
      DELETE FROM ts_messages_fts WHERE message_id = old.id;
    END;

    CREATE TRIGGER IF NOT EXISTS ts_messages_au AFTER UPDATE ON ts_messages BEGIN
      UPDATE ts_messages_fts SET content = new.content WHERE message_id = old.id;
    END;

    CREATE TABLE IF NOT EXISTS ts_reactions (
      id         TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      user_id    TEXT NOT NULL,
      emoji      TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(message_id, user_id, emoji),
      FOREIGN KEY (message_id) REFERENCES ts_messages(id) ON DELETE CASCADE
    );
  `);

  isDbInitialized = true;
}
