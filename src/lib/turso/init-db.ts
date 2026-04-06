import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  console.log("Creating tables...");
  
  try {
    console.log("Dropping existing tables...");
    const tables = [
      "messages", "threads", "reactions", "mentions", "polls", 
      "poll_options", "poll_votes", "media", "task_links"
    ];
    for (const table of tables) {
      await client.execute(`DROP TABLE IF EXISTS ${table};`);
    }
    console.log("Tables dropped successfully.");

    await client.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        text TEXT,
        type TEXT DEFAULT 'text',
        thread_count INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    console.log("Table 'messages' created successfully.");

    await client.execute(`
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    console.log("Table 'threads' created successfully.");

    await client.execute(`
      CREATE TABLE IF NOT EXISTS reactions (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        emoji TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    console.log("Table 'reactions' created successfully.");

    await client.execute(`
      CREATE TABLE IF NOT EXISTS mentions (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        mentioned_id TEXT NOT NULL,
        mentioned_by TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    console.log("Table 'mentions' created successfully.");

    await client.execute(`
      CREATE TABLE IF NOT EXISTS polls (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        message_id TEXT NOT NULL,
        question TEXT NOT NULL,
        created_by TEXT NOT NULL,
        expires_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    console.log("Table 'polls' created successfully.");

    await client.execute(`
      CREATE TABLE IF NOT EXISTS poll_options (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL,
        text TEXT NOT NULL,
        "order" INTEGER NOT NULL
      );
    `);
    console.log("Table 'poll_options' created successfully.");

    await client.execute(`
      CREATE TABLE IF NOT EXISTS poll_votes (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL,
        option_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        voted_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    console.log("Table 'poll_votes' created successfully.");

    await client.execute(`
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER NOT NULL,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    console.log("Table 'media' created successfully.");

    await client.execute(`
      CREATE TABLE IF NOT EXISTS task_links (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        linked_by TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    console.log("Table 'task_links' created successfully.");

  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    client.close();
  }
}

main();
