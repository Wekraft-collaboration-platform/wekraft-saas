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

// Safety-net: downgrade users whose paid plan period has expired.
// This fires even if the Stripe/Razorpay "subscription.deleted" webhook was missed.
crons.daily(
  "downgrade-expired-plans",
  { hourUTC: 0, minuteUTC: 30 }, // 00:30 AM UTC daily
  internal.payments.downgradeExpiredPlans,
);

export default crons;
