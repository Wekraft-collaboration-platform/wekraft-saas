import { turso } from "./client";

let isDbInitialized = false;

/**
 * Runs CREATE TABLE IF NOT EXISTS for all teamspace tables.
 * Safe to call on every cold start — idempotent.
 * Optimized to only run once per server instance lifecycle.
 *
 * IMPORTANT: All migration queries are inside the isDbInitialized guard.
 * Previously, 8 migration queries (including a full table scan UPDATE)
 * were running on EVERY request before the guard — causing massive Turso
 * row reads even with zero real activity.
 */
export async function initTeamspaceDB() {
  // Fast exit: already initialized in this server instance
  if (isDbInitialized) return;

  try {
    // Fast path: Check if main table exists. If it does, we assume DB is initialized.
    // This saves executing 15+ DDL statements on every serverless cold start.
    const check = await turso.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='ts_messages';"
    );
    if (check.rows.length > 0) {
      // Run lightweight schema migrations (ALTER TABLE / index additions)
      // These are cheap — they fail silently if columns already exist.
      await runMigrations();
      isDbInitialized = true;
      return;
    }
  } catch (e) {
    // Ignore error and fall through to full initialization
  }

  // Full initialization — only runs once when DB is brand new
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
      type        TEXT NOT NULL DEFAULT 'community',
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
      link_preview     TEXT,
      poll             TEXT,
      thread_parent_id TEXT,
      is_pinned        INTEGER NOT NULL DEFAULT 0,
      edited_at        INTEGER,
      created_at       INTEGER NOT NULL,
      expires_at       INTEGER,
      FOREIGN KEY (channel_id) REFERENCES ts_channels(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_messages_channel ON ts_messages(channel_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_thread  ON ts_messages(thread_parent_id);
    CREATE INDEX IF NOT EXISTS idx_messages_expires ON ts_messages(expires_at);

    CREATE VIRTUAL TABLE IF NOT EXISTS ts_messages_fts USING fts5(
      message_id,
      project_id,
      content,
      tokenize='porter'
    );

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
      id           TEXT PRIMARY KEY,
      user_id      TEXT NOT NULL,
      type         TEXT NOT NULL,
      sender_id    TEXT NOT NULL,
      sender_name  TEXT NOT NULL,
      sender_image TEXT,
      project_id   TEXT NOT NULL,
      channel_id   TEXT,
      message_id   TEXT,
      content      TEXT,
      is_read      INTEGER NOT NULL DEFAULT 0,
      created_at   INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON ts_notifications(user_id, created_at);

    CREATE TABLE IF NOT EXISTS ts_settings (
      project_id                   TEXT PRIMARY KEY,
      members_can_create_channels  INTEGER NOT NULL DEFAULT 0,
      members_can_edit_channels    INTEGER NOT NULL DEFAULT 0,
      members_can_delete_channels  INTEGER NOT NULL DEFAULT 0,
      updated_at                   INTEGER NOT NULL
    );
  `);

  await runMigrations();
  isDbInitialized = true;
}

/**
 * Lightweight schema migrations — safe to re-run, fail silently if already applied.
 * Called once per server instance after the table-existence check passes.
 *
 * These are the migrations that previously ran on EVERY request (before the
 * isDbInitialized guard), causing the huge Turso row-read counts.
 */
async function runMigrations() {
  // Add expires_at column for 30-day TTL
  try {
    await turso.execute("ALTER TABLE ts_messages ADD COLUMN expires_at INTEGER;");
    // Backfill — idx_messages_expires makes this efficient
    await turso.execute(
      "UPDATE ts_messages SET expires_at = created_at + 2592000000 WHERE expires_at IS NULL;"
    );
  } catch {
    // Column already exists — safe to ignore
  }

  // Add type column to notifications
  try {
    await turso.execute("ALTER TABLE ts_notifications ADD COLUMN type TEXT;");
    await turso.execute(
      "UPDATE ts_notifications SET type = 'mention' WHERE type IS NULL;"
    );
  } catch {
    // Column already exists — safe to ignore
  }

  // Add link_preview column
  try {
    await turso.execute("ALTER TABLE ts_messages ADD COLUMN link_preview TEXT;");
  } catch { /* already exists */ }

  // Add poll column
  try {
    await turso.execute("ALTER TABLE ts_messages ADD COLUMN poll TEXT;");
  } catch { /* already exists */ }

  // Add index on expires_at for efficient TTL expiry scanning
  try {
    await turso.execute(
      "CREATE INDEX IF NOT EXISTS idx_messages_expires ON ts_messages(expires_at);"
    );
  } catch { /* already exists */ }

  // Enable Turso native row expiry
  try {
    await turso.execute("PRAGMA turso_enable_expiry = ON;");
  } catch { /* older libsql versions — safe to ignore */ }

  // ── Private channel membership table ────────────────────────────────────
  // Tracks which Clerk user IDs are allowed to see a private channel.
  // ON DELETE CASCADE on channel_id ensures rows are cleaned up when a
  // private channel is deleted.
  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS ts_private_channel_members (
        channel_id  TEXT    NOT NULL,
        user_id     TEXT    NOT NULL,
        added_by    TEXT    NOT NULL,
        added_at    INTEGER NOT NULL,
        PRIMARY KEY (channel_id, user_id),
        FOREIGN KEY (channel_id) REFERENCES ts_channels(id) ON DELETE CASCADE
      )
    `);
  } catch { /* already exists — safe to ignore */ }

  try {
    await turso.execute(
      "CREATE INDEX IF NOT EXISTS idx_pcm_channel ON ts_private_channel_members(channel_id);"
    );
  } catch { /* already exists */ }

  try {
    await turso.execute(
      "CREATE INDEX IF NOT EXISTS idx_pcm_user ON ts_private_channel_members(user_id);"
    );
  } catch { /* already exists */ }

  // Add made_public_at column — tracks when a private channel was converted to public.
  // Messages created before this timestamp are hidden from all users (pre-conversion privacy).
  try {
    await turso.execute("ALTER TABLE ts_channels ADD COLUMN made_public_at INTEGER;");
  } catch { /* already exists — safe to ignore */ }
}