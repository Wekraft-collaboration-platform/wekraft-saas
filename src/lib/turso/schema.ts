import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

// Messages — 60-day retention
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  senderId: text("sender_id").notNull(), // Clerk userId
  text: text("text"),
  type: text("type").default("text"), // text | poll | task_link
  threadCount: integer("thread_count").default(0),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at"),
});

// Threads — replies on a message
export const threads = sqliteTable("threads", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull(),
  senderId: text("sender_id").notNull(),
  text: text("text").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// Reactions — emoji only, no like/unlike
export const reactions = sqliteTable("reactions", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull(),
  userId: text("user_id").notNull(),
  emoji: text("emoji").notNull(), // e.g. 'fire', 'heart', 'clap'
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// Mentions — @tags inside messages
export const mentions = sqliteTable("mentions", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull(),
  mentionedId: text("mentioned_id").notNull(), // Clerk userId
  mentionedBy: text("mentioned_by").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// Polls
export const polls = sqliteTable("polls", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  messageId: text("message_id").notNull(),
  question: text("question").notNull(),
  createdBy: text("created_by").notNull(),
  expiresAt: integer("expires_at"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// Poll options
export const pollOptions = sqliteTable("poll_options", {
  id: text("id").primaryKey(),
  pollId: text("poll_id").notNull(),
  text: text("text").notNull(),
  order: integer("order").notNull(),
});

// Poll votes
export const pollVotes = sqliteTable("poll_votes", {
  id: text("id").primaryKey(),
  pollId: text("poll_id").notNull(),
  optionId: text("option_id").notNull(),
  userId: text("user_id").notNull(),
  votedAt: integer("voted_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// Media — using Convex File URLs
export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull(),
  url: text("url").notNull(), // Convex Storage URL
  type: text("type").notNull(), // image | pdf
  size: integer("size").notNull(), // bytes
  name: text("name").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// Task links — tasks/issues linked inside messages
export const taskLinks = sqliteTable("task_links", {
  id: text("id").primaryKey(),
  messageId: text("message_id").notNull(),
  taskId: text("task_id").notNull(), // ID from Convex tasks table
  linkedBy: text("linked_by").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});
