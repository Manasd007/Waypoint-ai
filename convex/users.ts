import {
  internalMutation,
  internalQuery,
  mutation,
  MutationCtx,
  query,
  QueryCtx,
} from "./_generated/server";

import { ConvexError, v } from "convex/values";
import { Doc } from "./_generated/dataModel";

/** Get user by Clerk use id (AKA "subject" on auth)  */
export const getUser = internalQuery({
  args: { subject: v.string() },
  async handler(ctx, args) {
    return await userQuery(ctx, args.subject);
  },
});

/** Create a new Clerk user or update existing Clerk user data. */
export const createUser = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  async handler(ctx, { userId, email, firstName, lastName }) {
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (userRecord === null) {
      await ctx.db.insert("users", {
        userId,
        credits: 10, // Start with 10 free credits
        email,
        firstName,
        lastName,
        createdAt: Date.now(),
      });
    }
  },
});

/**
 * Called by the client whenever it mounts.
 * If the user already exists, returns their credit balance.
 * If not, creates the row with 10 free credits and returns 10.
 */
export const getOrCreateUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("userId", clerkId))
      .unique();

    if (existing) return existing.credits;

    const id = await ctx.db.insert("users", {
      userId: clerkId,
      credits: 10, // 🎁 free starter credits
      email: "", // This will be updated when user data is synced
      createdAt: Date.now(),
    });
    return 10;
  },
});

/* Helper query the UI can call at any time */
export const myCredits = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("userId", clerkId))
      .unique();
    return user?.credits ?? 0;
  },
});

export const consumeCredit = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("userId", clerkId))
      .unique();
    if (!user) throw new Error("User row missing");

    if (user.credits <= 0) throw new Error("No credits left");

    await ctx.db.patch(user._id, { credits: user.credits - 1 });
  },
});

export const reduceUserCreditsByOne = mutation({
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not Authrized to perform this action");
    }

    const userRecord = await userQuery(ctx, identity.subject);
    if (userRecord != null) {
        await ctx.db.patch(userRecord._id, { credits: userRecord.credits - 1 });
    } else console.log("user Not found while reducing credit");
  },
});

export const updateDisplayNameFromClerk = mutation({
  args: { firstName: v.string(), lastName: v.string(), userId: v.string() },
  async handler(ctx, { firstName, lastName, userId }) {
    if (!userId || !firstName)
      console.log(
        `Not able to update display name from clerk as either firstname of userid is empty`
      );
    const userRecord = await userQuery(ctx, userId);

    if (!userRecord)
      throw new ConvexError("No User found to update display name");
    console.log({ firstName, lastName });
    await ctx.db.patch(userRecord?._id, { firstName, lastName });
  },
});

export const updateDisplayName = mutation({
  args: { firstName: v.string(), lastName: v.string() },
  async handler(ctx, { firstName, lastName }) {
    if (!firstName) throw new ConvexError("First Name is mandatory!");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not Authrized to update display name");
    }

    const userRecord = await userQuery(ctx, identity.subject);

    if (!userRecord)
      throw new ConvexError("No User found to update display name");
    console.log({ firstName, lastName });
    await ctx.db.patch(userRecord?._id, { firstName, lastName });
  },
});

export const updateUserCredits = async (
  ctx: MutationCtx,
  email: string,
  amount: number
) => {
  const creditsToUpdate = (amount / 100 / 80) * 5;
  const user_object = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();

  if (user_object != null)
    await ctx.db.patch(user_object._id, {
      credits: (user_object?.credits ?? 0) + creditsToUpdate,
    });
};

// Helpers

export async function userQuery(ctx: QueryCtx, clerkUserId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("userId", clerkUserId))
    .unique();
}

/** The current user, containing user preferences and Clerk user info. */
export const currentUser = query((ctx: QueryCtx) => getCurrentUser(ctx));

async function getCurrentUser(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userQuery(ctx, identity.subject);
}
