import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a URL for uploading a file
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get the public URL for a stored file
export const getUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

// Delete a stored file (if message is deleted or expires)
export const deleteFile = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    await ctx.storage.delete(storageId);
  },
});
