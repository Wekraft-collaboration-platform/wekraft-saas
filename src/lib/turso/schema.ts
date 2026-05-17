import { turso } from "./client";

let isDbInitialized = false;

/**
 * Runs CREATE TABLE IF NOT EXISTS for all teamspace tables.
 * Safe to call on every cold start — idempotent.
 * Optimized to only run once per server instance lifecycle.
 */
export async function initTeamspaceDB() {
  // 1. Ensure migrations and new tables (ts_channel_reads, ts_notifications) are created first
  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS ts_channel_reads (
        user_id      TEXT NOT NULL,
        channel_id   TEXT NOT NULL,
        last_read_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, channel_id)
      );
    `);
  } catch (e) {
    // Table likely already exists
  }

  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS ts_notifications (
        id          TEXT PRIMARY KEY,
        user_id     TEXT NOT NULL,
        type        TEXT NOT NULL,
        sender_id    TEXT NOT NULL,
        sender_name  TEXT NOT NULL,
        sender_image TEXT,
        project_id  TEXT NOT NULL,
        channel_id  TEXT,
        message_id  TEXT,
        content     TEXT,
        is_read     INTEGER NOT NULL DEFAULT 0,
        created_at  INTEGER NOT NULL
      );
    `);
    await turso.execute("CREATE INDEX IF NOT EXISTS idx_notifications_user ON ts_notifications(user_id, created_at);");
  } catch (e) {
    // Table/Index likely already exists
  }

  if (isDbInitialized) return;

  try {
    // Fast path: Check if main table exists. If it does, we assume DB is initialized.
    // This saves executing 15+ DDL statements on every serverless cold start.
    const check = await turso.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ts_messages';");
    if (check.rows.length > 0) {
      isDbInitialized = true;
      return;
    }
  } catch (e) {
    // Ignore error and fall through to initialization
  }

  // Ensure other columns/tables are applied
  try {
    await turso.execute(
      "ALTER TABLE ts_messages ADD COLUMN link_preview TEXT;",
    );
  } catch (e) {
    // Column likely already exists
  }
  try {
    await turso.execute("ALTER TABLE ts_messages ADD COLUMN poll TEXT;");
  } catch (e) {
    // Column likely already exists
  }

  await turso.executeMultiple(`
    CREATE TABLE IF NOT EXISTS ts_channel_reads (
      user_id      TEXT NOT NULL,
      channel_id   TEXT NOT NULL,
      last_read_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, channel_id)
    );

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
      poll             TEXT, -- JSON metadata for polls
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

    CREATE TABLE IF NOT EXISTS ts_poll_votes (
      id         TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      option_id  TEXT NOT NULL,
      user_id    TEXT NOT NULL,
      user_name  TEXT NOT NULL,
      user_image TEXT,
      created_at INTEGER NOT NULL,
      UNIQUE(message_id, option_id, user_id),
      FOREIGN KEY (message_id) REFERENCES ts_messages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ts_notifications (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      type        TEXT NOT NULL, -- 'mention'
      sender_id    TEXT NOT NULL,
      sender_name  TEXT NOT NULL,
      sender_image TEXT,
      project_id  TEXT NOT NULL,
      channel_id  TEXT,
      message_id  TEXT,
      content     TEXT,
      is_read     INTEGER NOT NULL DEFAULT 0,
      created_at  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON ts_notifications(user_id, created_at);

    CREATE TABLE IF NOT EXISTS ts_settings (
      project_id TEXT PRIMARY KEY,
      members_can_create_channels INTEGER NOT NULL DEFAULT 0,
      members_can_edit_channels INTEGER NOT NULL DEFAULT 0,
      members_can_delete_channels INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
  `);

  isDbInitialized = true;
}
