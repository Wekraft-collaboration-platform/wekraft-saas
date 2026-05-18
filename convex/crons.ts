import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Schedule deleting notifications older than 30 days
crons.daily(
  "cleanup-old-notifications",
  { hourUTC: 2, minuteUTC: 0 }, // 2:00 AM UTC daily
  internal.notifications.deleteOldNotifications,
  { maxAgeDays: 30 },
);

export default crons;
