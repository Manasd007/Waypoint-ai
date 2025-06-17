/**
 * This file defines a `runAction` helper function that can be used to retry a
 * Convex action until it succeeds. An action should only be retried if it is
 * safe to do so, i.e., if it's idempotent or doesn't have any unsafe side effects.
 */

import { internalMutation, mutation } from "./_generated/server";
import { makeFunctionReference } from "convex/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";

const DEFAULT_WAIT_BACKOFF = 1000;  // 1 second
const DEFAULT_RETRY_BACKOFF = 2000; // 2 seconds
const DEFAULT_BASE = 2;
const DEFAULT_MAX_FAILURES = 5;     // Reduced from 16 to 5 to fail faster if there's an issue

/**
 * Run and retry action until it succeeds or fails too many times.
 *
 * @param action - Name of the action to run, e.g., `usercode:maybeAction`.
 * @param actionArgs - Arguments to pass to the action, e.g., `{"failureRate": 0.75}`.
 * @param [waitBackoff=DEFAULT_WAIT_BACKOFF (1000)] - Initial delay before checking action status, in milliseconds.
 * @param [retryBackoff=DEFAULT_RETRY_BACKOFF (2000)] - Initial delay before retrying, in milliseconds.
 * @param [base=DEFAULT_BASE (2)] - Base of the exponential backoff.
 * @param [maxFailures=DEFAULT_MAX_FAILURES (5)] - The maximum number of times to retry the action.
 */
export const runAction = mutation({
    args: {
        action: v.string(),
        actionArgs: v.any(),
        waitBackoff: v.optional(v.number()),
        retryBackoff: v.optional(v.number()),
        base: v.optional(v.number()),
        maxFailures: v.optional(v.number()),
    },
    handler: async (
        ctx,
        {
            action,
            actionArgs,
            waitBackoff = DEFAULT_WAIT_BACKOFF,
            retryBackoff = DEFAULT_RETRY_BACKOFF,
            base = DEFAULT_BASE,
            maxFailures = DEFAULT_MAX_FAILURES,
        }
    ) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity == null) {
            console.error(`[RETRIER] Authentication failed for action: ${action}`);
            throw new ConvexError("Not Authenticated");
        }

        console.log(`[RETRIER] Starting action: ${action}`, {
            actionArgs,
            waitBackoff,
            retryBackoff,
            base,
            maxFailures,
            userId: identity.subject
        });

        try {
            const job = await ctx.scheduler.runAfter(
                0,
                makeFunctionReference<"action">(action),
                actionArgs,
            );

            console.log(`[RETRIER] Scheduled job: ${job} for action: ${action}`);

            await ctx.scheduler.runAfter(0, internal.retrier.retry, {
                job,
                action,
                actionArgs,
                waitBackoff,
                retryBackoff,
                base,
                maxFailures,
            });
        } catch (error) {
            console.error(`[RETRIER] Failed to schedule action: ${action}`, {
                error,
                actionArgs,
                userId: identity.subject
            });
            throw new ConvexError(`Failed to schedule action: ${error}`);
        }
    },
});

export const retry = internalMutation({
    args: {
        job: v.id("_scheduled_functions"),
        action: v.string(),
        actionArgs: v.any(),
        waitBackoff: v.number(),
        retryBackoff: v.number(),
        base: v.number(),
        maxFailures: v.number(),
    },
    handler: async (ctx, args) => {
        const { job, action, maxFailures } = args;
        try {
            const status = await ctx.db.system.get(job);
            if (!status) {
                console.error(`[RETRIER] Job ${job} not found for action: ${action}`);
                throw new Error(`Job ${job} not found`);
            }

            switch (status.state.kind) {
                case "pending":
                case "inProgress":
                    console.log(
                        `[RETRIER] Job ${job} not yet complete for action: ${action}, checking again in ${args.waitBackoff}ms`
                    );
                    await ctx.scheduler.runAfter(args.waitBackoff, internal.retrier.retry, {
                        ...args,
                        waitBackoff: args.waitBackoff * args.base,
                    });
                    break;

                case "failed":
                    if (maxFailures <= 0) {
                        console.error(`[RETRIER] Job ${job} failed too many times for action: ${action}`, {
                            error: status.state.error,
                            remainingFailures: maxFailures
                        });
                        break;
                    }
                    console.warn(`[RETRIER] Job ${job} failed for action: ${action}, retrying in ${args.retryBackoff}ms`, {
                        error: status.state.error,
                        remainingFailures: maxFailures - 1
                    });
                    const newJob = await ctx.scheduler.runAfter(
                        args.retryBackoff,
                        makeFunctionReference<"action">(action),
                        args.actionArgs
                    );
                    await ctx.scheduler.runAfter(
                        args.retryBackoff,
                        internal.retrier.retry,
                        {
                            ...args,
                            job: newJob,
                            retryBackoff: args.retryBackoff * args.base,
                            maxFailures: maxFailures - 1,
                        }
                    );
                    break;

                case "success":
                    console.log(`[RETRIER] Job ${job} succeeded for action: ${action}`);
                    break;

                case "canceled":
                    console.warn(`[RETRIER] Job ${job} was canceled for action: ${action}`);
                    break;
            }
        } catch (error) {
            console.error(`[RETRIER] Error in retry handler for job ${job} and action: ${action}`, {
                error,
                maxFailures
            });
            if (maxFailures <= 0) {
                throw new ConvexError(`Retry failed after ${DEFAULT_MAX_FAILURES} attempts: ${error}`);
            }
            // Continue retrying if we have failures left
            const newJob = await ctx.scheduler.runAfter(
                args.retryBackoff,
                makeFunctionReference<"action">(action),
                args.actionArgs
            );
            await ctx.scheduler.runAfter(
                args.retryBackoff,
                internal.retrier.retry,
                {
                    ...args,
                    job: newJob,
                    retryBackoff: args.retryBackoff * args.base,
                    maxFailures: maxFailures - 1,
                }
            );
        }
    },
});