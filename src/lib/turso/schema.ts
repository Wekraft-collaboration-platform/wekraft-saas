import { turso } from "./client";

/**
 * Runs CREATE TABLE IF NOT EXISTS for all teamspace tables.
 * Safe to call on every cold start — idempotent.
 */
export async function initTeamspaceDB() {
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
      thread_parent_id TEXT,
      edited_at        INTEGER,
      created_at       INTEGER NOT NULL,
      FOREIGN KEY (channel_id) REFERENCES ts_channels(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_messages_channel ON ts_messages(channel_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_thread  ON ts_messages(thread_parent_id);

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
}
