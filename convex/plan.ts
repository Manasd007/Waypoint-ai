import {
  ActionCtx,
  MutationCtx,
  QueryCtx,
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

import { ConvexError, v } from "convex/values";

import { generatebatch1, generatebatch2, generatebatch3 } from "../lib/gemini";
import { getCurrentPlanSettings } from "./planSettings";
import { getIdentityOrThrow } from "./utils";

export const PlanAdmin = query({
  args: { planId: v.string() },
  handler: async (ctx, args) => {
    return getPlanAdmin(ctx, args.planId);
  },
});

export const getPlanAdmin = async (ctx: QueryCtx, planId: string) => {
  const identity = await getIdentityOrThrow(ctx);
  if (!identity) {
    return { isPlanAdmin: false, planName: "" };
  }

  const { subject } = identity;

  const plan = await ctx.db.get(planId as Id<"plan">);
  if (plan && plan.userId === subject)
    return { isPlanAdmin: true, planName: plan.nameoftheplace };
  return { isPlanAdmin: false, planName: "" };
};

const getSharedPlans = async (ctx: QueryCtx, userId: string) => {
  const accessRecords = await ctx.db
    .query("access")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  if (!accessRecords.length) return [];

  // Batch fetch plans
  const planIds = accessRecords.map((record) => record.planId);
  const plans = await Promise.all(planIds.map((id) => ctx.db.get(id)));

  return plans.filter((plan): plan is Doc<"plan"> => plan !== null);
};

export const getAllUsersForAPlan = query({
  args: {
    planId: v.id("plan"),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);

    // Parallel fetch of plan and access records using proper indexing
    const [planRecord, accessRecords] = await Promise.all([
      ctx.db.get(args.planId),
      ctx.db
        .query("access")
        .withIndex("by_planId_userId", (q) =>
          q.eq("planId", args.planId).eq("userId", identity.subject)
        )
        .collect(),
    ]);

    if (!planRecord) {
      throw new ConvexError("Plan not found");
    }

    const userIds = [planRecord.userId, ...accessRecords.map((a) => a.userId)];

    // Batch fetch all users in a single query using IN operator
    const users = await Promise.all(
      userIds.map((userId) =>
        ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("userId", userId))
          .unique()
      )
    );

    return users
      .filter((user): user is Doc<"users"> => user !== null)
      .map((user) => ({
        ...user,
        IsCurrentUser: user.userId === identity.subject,
      }));
  },
});

export const getAllPlansForAUser = query({
  handler: async (ctx) => {
    const identity = await getIdentityOrThrow(ctx);
    const { subject } = identity;
    const [ownPlans, sharedPlans] = await Promise.all([
      ctx.db
        .query("plan")
        .withIndex("by_userId", (q) => q.eq("userId", subject))
        .collect(),
      getSharedPlans(ctx, subject),
    ]);

    console.log(`getAllPlansForAUser called by ${identity.subject}`);

    const sharedPlansIds = sharedPlans.map((s) => s._id);
    const combinedPlans = ownPlans.concat(sharedPlans);
    const data = await Promise.all(
      combinedPlans.map(async (plan) => {
        const planSettings = await ctx.db
          .query("planSettings")
          .withIndex("by_planId_userId", (q) =>
            q.eq("planId", plan._id).eq("userId", plan.userId)
          )
          .unique();

        return {
          ...plan,
          isSharedPlan: sharedPlansIds.includes(plan._id),
          fromDate: planSettings?.fromDate,
          toDate: planSettings?.toDate,
        };
      })
    );

    return data;
  },
});

export const getPublicPlans = query({
  handler: async (ctx, args) => {
    //DEV
    // const PUBLIC_PLAN_IDS = [
    //   "j976a67c74q3xc7y2qsmb604nx6vmezb",
    //   "j97ca9yx3tb060fzn4q5vkcp9n6vmjrx",
    //   "j97b73bvd01yz48vee5m4f7qzh6vm5se",
    //   "j973yvgba3kj2fx4fnzzsyq6rh6vgx2r",
    //   "j979zkt2b9t48dnd3krfw01rvx6vhavh",
    //   "j975a4bq83amm742n5k10vfm1s6vgk9p",
    //   "j979ptn9m6pzvbqx26nmfdhst56vgk45",
    //   "j9767ymcmq280qjkabpys8ge6s6vgyc1",
    // ] as Id<"plan">[];
    //PROD
    const PUBLIC_PLAN_IDS = [
      "jd73xpv2e417cnt5fs60w8vwbn6vqfdj",
      "jd75gwr8yhbqmbq0fkssdppry16vpdk3",
      "jd72kt9m26299j0d5f97mr3qds6vqtce",
      "jd7bfx1pet9e4909b29j93qrxx6vpsey",
      "jd78qtw04cspjvq34y1r3athj96vqa37",
      "jd7et3d9vqv3y76j5yjmja9qjx6vq85s",
      "jd74j1rpwdsy0hrk5cv0b0v8416vpm41",
      "jd7ek50gqv72was2q4fdmmy6n96vqwc8",
    ] as Id<"plan">[];
    const plans = await Promise.all(
      PUBLIC_PLAN_IDS.map((id) => ctx.db.get(id as Id<"plan">))
    );

    console.log(plans);

    // Filter out null plans and prepare URL fetching
    const validPlans = plans.filter(
      (plan): plan is Doc<"plan"> => plan !== null
    );

    // Batch process plans with their URLs and settings
    const processedPlans = await Promise.all(
      validPlans.map(async (plan) => {
        const url = plan.storageId
          ? await ctx.storage.getUrl(plan.storageId)
          : null;

        // Get plan settings for fromDate and toDate
        const planSettings = await ctx.db
          .query("planSettings")
          .withIndex("by_planId", (q) => q.eq("planId", plan._id))
          .unique();

        return {
          ...plan,
          isSharedPlan: false,
          url,
          fromDate: planSettings?.fromDate,
          toDate: planSettings?.toDate,
        };
      })
    );

    return processedPlans;
  },
});

export const getComboBoxPlansForAUser = query({
  handler: async (ctx) => {
    const identity = await getIdentityOrThrow(ctx);
    const { subject } = identity;

    const ownPlans = await ctx.db
      .query("plan")
      .withIndex("by_userId", (q) => q.eq("userId", subject))
      .collect();
    console.log(`getComboBoxPlansForAUser called by ${subject}`);
    const sharedPlans = await getSharedPlans(ctx, subject);
    const allPlans = ownPlans.concat(sharedPlans);

    return allPlans;
  },
});

const validatePlanAccess = async (
  ctx: QueryCtx | MutationCtx,
  planId: Id<"plan">,
  userId: string
) => {
  const plan = await ctx.db.get(planId);
  if (!plan) {
    throw new ConvexError("Plan not found");
  }

  const isPlanAdmin = plan.userId === userId;
  if (!isPlanAdmin) {
    const access = await ctx.db
      .query("access")
      .withIndex("by_planId_userId", (q) =>
        q.eq("planId", planId).eq("userId", userId)
      )
      .first();

    if (!access) {
      throw new ConvexError("Unauthorized access to plan");
    }
  }
  return { plan, isPlanAdmin };
};

export const getSinglePlan = query({
  args: { id: v.id("plan"), isPublic: v.boolean() },
  handler: async (ctx, args) => {
    if (!args.isPublic) {
      const identity = await getIdentityOrThrow(ctx);
      const { plan, isPlanAdmin } = await validatePlanAccess(
        ctx,
        args.id,
        identity.subject
      );

      const planSettings = await getCurrentPlanSettings(ctx, plan._id);
      console.log(
        `getSinglePlan called by ${identity.subject} for planid: ${args.id}`
      );
      return {
        ...plan,
        isSharedPlan: !isPlanAdmin,
        activityPreferences: planSettings?.activityPreferences ?? [],
        fromDate: planSettings?.fromDate,
        toDate: planSettings?.toDate,
        companion: planSettings?.companion,
        isPublished: planSettings?.isPublished ?? false,
      };
    } else {
      const plan = await ctx.db.get(args.id);
      const planSettings = await ctx.db
        .query("planSettings")
        .withIndex("by_planId", (q) => q.eq("planId", args.id))
        .unique();
      if (!plan || !planSettings || !planSettings.isPublished) {
        throw new ConvexError("Plan not found or not public");
      }

      return {
        ...plan,
        isSharedPlan: false,
        activityPreferences: planSettings?.activityPreferences ?? [],
        fromDate: planSettings?.fromDate,
        toDate: planSettings?.toDate,
        companion: planSettings?.companion,
        isPublished: true,
      };
    }
  },
});

export const readPlanData = internalQuery({
  args: { id: v.id("plan") },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.id);
    return plan;
  },
});

const fetchEmptyPlan = async (ctx: ActionCtx, planId: string) => {
  return ctx.runQuery(internal.plan.readPlanData, {
    id: planId as Doc<"plan">["_id"],
  });
};

//Actions to be called for prepareing the plan
export const prepareBatch1 = action({
  args: {
    planId: v.string(),
  },
  handler: async (ctx, { planId }) => {
    try {
      console.log(`Starting prepareBatch1 for plan ${planId}`);
      const emptyPlan = await fetchEmptyPlan(ctx, planId);

      if (!emptyPlan) {
        console.error(`Empty plan not found for planId: ${planId}`);
        throw new ConvexError(
          "Unable to find the empty plan while preparing a new one"
        );
      }

      console.log(`Generating batch1 content for: ${emptyPlan.userPrompt}`);
      const completion = await generatebatch1(emptyPlan.userPrompt);

      if (!completion?.choices?.[0]?.message?.function_call?.arguments) {
        console.error(`No completion received for planId: ${planId}`);
        throw new ConvexError("No completion received from Gemini");
      }

      const nameMsg = completion.choices[0].message.function_call.arguments;
      console.log(`Received completion for planId: ${planId}`);

      const modelName = JSON.parse(nameMsg) as Pick<
        Doc<"plan">,
        "abouttheplace" | "besttimetovisit"
      >;

      await ctx.runMutation(internal.plan.updateAboutThePlaceBestTimeToVisit, {
        abouttheplace: modelName.abouttheplace,
        besttimetovisit: modelName.besttimetovisit,
        planId: emptyPlan._id,
      });
      console.log(`Successfully completed prepareBatch1 for plan ${planId}`);
    } catch (error) {
      console.error(`Error in prepareBatch1 for plan ${planId}:`, error);
      throw new ConvexError(
        `Error occurred in prepare Plan Convex action: ${error}`
      );
    }
  },
});

export const prepareBatch2 = action({
  args: {
    planId: v.string(),
  },
  handler: async (ctx, { planId }) => {
    try {
      console.log(`Starting prepareBatch2 for plan ${planId}`);

      const emptyPlan = await fetchEmptyPlan(ctx, planId);

      if (!emptyPlan) {
        console.error(`Empty plan not found for planId: ${planId}`);
        throw new ConvexError("Unable to find the empty plan while preparing a new one");
      }

      const planMetadata = await ctx.runQuery(
        internal.planSettings.getPlanSettings,
        {
          planId: emptyPlan._id,
        }
      );

      if (!planMetadata) {
        console.error(`Plan metadata not found for planId: ${planId}`);
        throw new ConvexError("Unable to find the plan metadata while preparing a new one");
      }

      const { activityPreferences, companion, fromDate, toDate } = planMetadata;
      console.log(`Generating batch2 content for plan ${planId} with preferences:`, {
        activityPreferences,
        companion,
        fromDate,
        toDate
      });

      const completion = await generatebatch2({
        userPrompt: emptyPlan.userPrompt,
        activityPreferences,
        companion,
        fromDate,
        toDate,
      });

      if (!completion?.choices?.[0]?.message?.function_call?.arguments) {
        console.error(`No completion received for planId: ${planId}`);
        throw new ConvexError("No completion received from Gemini");
      }

      const nameMsg = completion.choices[0].message.function_call.arguments;
      console.log(`Received completion for planId: ${planId}`);

      const modelName = JSON.parse(nameMsg) as Pick<
        Doc<"plan">,
        | "adventuresactivitiestodo"
        | "localcuisinerecommendations"
        | "packingchecklist"
      >;

      await ctx.runMutation(
        internal.plan.updateActivitiesToDoPackingChecklistLocalCuisineRecommendations,
        {
          adventuresactivitiestodo: modelName.adventuresactivitiestodo,
          localcuisinerecommendations: modelName.localcuisinerecommendations,
          packingchecklist: modelName.packingchecklist,
          planId: emptyPlan._id,
        }
      );
      console.log(`Successfully completed prepareBatch2 for plan ${planId}`);
    } catch (error) {
      console.error(`Error in prepareBatch2 for plan ${planId}:`, error);
      throw new ConvexError(`Error occurred in prepare Plan Convex action: ${error}`);
    }
  },
});

export const prepareBatch3 = action({
  args: {
    planId: v.string(),
  },
  handler: async (ctx, { planId }) => {
    try {
      console.log(`[ITINERARY] Starting prepareBatch3 for plan ${planId}`);

      // Fetch and validate empty plan
      const emptyPlan = await fetchEmptyPlan(ctx, planId);
      console.log(`[ITINERARY] Fetched empty plan:`, {
        planId,
        userPrompt: emptyPlan?.userPrompt,
        exists: !!emptyPlan,
        hasUserPrompt: !!emptyPlan?.userPrompt
      });

      if (!emptyPlan) {
        console.error(`[ITINERARY] Empty plan not found for planId: ${planId}`);
        throw new ConvexError("Unable to find the empty plan while preparing a new one");
      }

      if (!emptyPlan.userPrompt?.trim()) {
        console.error(`[ITINERARY] Empty user prompt for planId: ${planId}`);
        throw new ConvexError("User prompt is required for generating itinerary");
      }

      // Fetch and validate plan metadata
      const planMetadata = await ctx.runQuery(
        internal.planSettings.getPlanSettings,
        {
          planId: emptyPlan._id,
        }
      );
      console.log(`[ITINERARY] Fetched plan metadata:`, {
        planId,
        hasMetadata: !!planMetadata,
        activityPreferences: planMetadata?.activityPreferences,
        companion: planMetadata?.companion,
        fromDate: planMetadata?.fromDate,
        toDate: planMetadata?.toDate,
        hasDates: !!(planMetadata?.fromDate && planMetadata?.toDate)
      });

      if (!planMetadata) {
        console.error(`[ITINERARY] Plan metadata not found for planId: ${planId}`);
        throw new ConvexError("Unable to find the plan metadata while preparing a new one");
      }

      if (!planMetadata.fromDate || !planMetadata.toDate) {
        console.error(`[ITINERARY] Missing date range for planId: ${planId}`);
        throw new ConvexError("Date range is required for generating itinerary");
      }

      const { activityPreferences, companion, fromDate, toDate } = planMetadata;
      const prompt = {
        userPrompt: emptyPlan.userPrompt,
        activityPreferences: activityPreferences || [],
        companion: companion || undefined,
        fromDate,
        toDate,
      };
      console.log(`[ITINERARY] Calling Gemini with prompt:`, {
        ...prompt,
        userPrompt: prompt.userPrompt.substring(0, 100) + "..." // Truncate for logging
      });

      // Call Gemini with timeout
      const completion = await Promise.race([
        generatebatch3(prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Gemini API call timed out")), 30000)
        )
      ]).catch(error => {
        console.error(`[ITINERARY] Gemini API call failed for planId: ${planId}`, {
          error: error instanceof Error ? error.message : String(error),
          prompt: prompt.userPrompt.substring(0, 100) + "..."
        });
        throw new ConvexError(`Gemini API call failed: ${error instanceof Error ? error.message : String(error)}`);
      });

      // Type guard for Gemini completion
      if (!completion || typeof completion !== 'object' || !('choices' in completion)) {
        console.error(`[ITINERARY] Invalid completion format for planId: ${planId}`);
        throw new ConvexError("Invalid completion format received from Gemini");
      }

      const choices = completion.choices;
      if (!Array.isArray(choices) || choices.length === 0 || 
          !choices[0]?.message?.function_call?.arguments) {
        console.error(`[ITINERARY] Invalid completion structure for planId: ${planId}`);
        throw new ConvexError("Invalid completion structure received from Gemini");
      }

      const nameMsg = choices[0].message.function_call.arguments;
      console.log(`[ITINERARY] Parsing completion arguments`);

      let parsedData: Pick<Doc<"plan">, "itinerary" | "topplacestovisit">;
      try {
        parsedData = JSON.parse(nameMsg);
      } catch (error) {
        console.error(`[ITINERARY] Failed to parse completion arguments for planId: ${planId}`, {
          error: error instanceof Error ? error.message : String(error),
          arguments: nameMsg.substring(0, 100) + "..." // Truncate for logging
        });
        throw new ConvexError("Failed to parse Gemini response");
      }

      // Validate parsed data
      if (!parsedData.itinerary?.length || !parsedData.topplacestovisit?.length) {
        console.error(`[ITINERARY] Invalid itinerary data for planId: ${planId}`, {
          hasItinerary: !!parsedData.itinerary?.length,
          hasTopPlaces: !!parsedData.topplacestovisit?.length
        });
        throw new ConvexError("Generated itinerary data is incomplete");
      }

      // Validate coordinates
      const invalidPlaces = parsedData.topplacestovisit.filter(
        place => !place.coordinates?.lat || !place.coordinates?.lng
      );
      if (invalidPlaces.length > 0) {
        console.error(`[ITINERARY] Invalid coordinates in top places for planId: ${planId}`, {
          invalidPlaces: invalidPlaces.map(p => p.name)
        });
        throw new ConvexError("Some places are missing coordinates");
      }

      await ctx.runMutation(internal.plan.updateItineraryTopPlacesToVisit, {
        itinerary: parsedData.itinerary,
        topplacestovisit: parsedData.topplacestovisit,
        planId: emptyPlan._id,
      });

      console.log(`[ITINERARY] Successfully updated plan ${planId} with itinerary and top places`);
    } catch (error) {
      console.error(`[ITINERARY] Error in prepareBatch3 for plan ${planId}:`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new ConvexError(
        `Error occurred in prepare Plan Convex action: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});

//Mutation Patches after Gemini responds
export const updateAboutThePlaceBestTimeToVisit = internalMutation({
  args: {
    planId: v.id("plan"),
    abouttheplace: v.string(),
    besttimetovisit: v.string(),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    console.log(
      `updateAboutThePlaceBestTimeToVisit called on planId : ${args.planId}`
    );
    await ctx.db.patch(args.planId, {
      abouttheplace: args.abouttheplace,
      besttimetovisit: args.besttimetovisit,
      contentGenerationState: {
        ...plan!.contentGenerationState,
        abouttheplace: true,
        besttimetovisit: true,
      },
    });
  },
});

export const updateActivitiesToDoPackingChecklistLocalCuisineRecommendations =
  internalMutation({
    args: {
      planId: v.id("plan"),
      adventuresactivitiestodo: v.array(v.string()),
      packingchecklist: v.array(v.string()),
      localcuisinerecommendations: v.array(v.string()),
    },
    handler: async (ctx, args) => {
      const plan = await ctx.db.get(args.planId);
      console.log(
        `updateActivitiesToDoPackingChecklistLocalCuisineRecommendations called on planId : ${args.planId}`
      );
      await ctx.db.patch(args.planId, {
        adventuresactivitiestodo: args.adventuresactivitiestodo,
        packingchecklist: args.packingchecklist,
        localcuisinerecommendations: args.localcuisinerecommendations,
        contentGenerationState: {
          ...plan!.contentGenerationState,
          adventuresactivitiestodo: true,
          packingchecklist: true,
          localcuisinerecommendations: true,
        },
      });
    },
  });

export const updateItineraryTopPlacesToVisit = internalMutation({
  args: {
    planId: v.id("plan"),
    topplacestovisit: v.array(
      v.object({
        name: v.string(),
        coordinates: v.object({
          lat: v.float64(),
          lng: v.float64(),
        }),
      })
    ),
    itinerary: v.array(
      v.object({
        title: v.string(),
        morning: v.array(
          v.object({
            description: v.string(),
            brief: v.string(),
          })
        ),
        afternoon: v.array(
          v.object({
            description: v.string(),
            brief: v.string(),
          })
        ),
        evening: v.array(
          v.object({
            description: v.string(),
            brief: v.string(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    console.log(
      `updateItineraryTopPlacesToVisit called on planId : ${args.planId}`
    );
    await ctx.db.patch(args.planId, {
      topplacestovisit: args.topplacestovisit,
      itinerary: args.itinerary,
      contentGenerationState: {
        ...plan!.contentGenerationState,
        topplacestovisit: true,
        itinerary: true,
      },
    });
  },
});

//edit in UI

export const updatePartOfPlan = mutation({
  args: {
    planId: v.id("plan"),
    data: v.union(
      v.string(),
      v.array(v.string()),
      v.array(
        v.object({
          name: v.string(),
          coordinates: v.object({
            lat: v.float64(),
            lng: v.float64(),
          }),
        })
      )
    ),
    key: v.union(
      v.literal("abouttheplace"),
      v.literal("besttimetovisit"),
      v.literal("packingchecklist"),
      v.literal("localcuisinerecommendations"),
      v.literal("adventuresactivitiestodo"),
      v.literal("topplacestovisit")
    ),
  },
  handler: async (ctx, args) => {
    const { subject } = await getIdentityOrThrow(ctx);
    console.log(
      `updatePartOfPlan called by ${subject} on planId : ${args.planId}`
    );
    await ctx.db.patch(args.planId, {
      [args.key]: args.data,
    });
  },
});

export const updatePlaceToVisit = mutation({
  args: {
    planId: v.id("plan"),
    lat: v.float64(),
    lng: v.float64(),
    placeName: v.string(),
  },
  handler: async (ctx, args) => {
    const { subject } = await getIdentityOrThrow(ctx);
    console.log(
      `updatePlaceToVisit called by ${subject} on planId : ${args.planId}`
    );
    const plan = await ctx.db.get(args.planId);
    if (!plan) return;
    const existing = plan?.topplacestovisit;
    await ctx.db.patch(plan?._id, {
      topplacestovisit: [
        ...existing,
        {
          name: args.placeName,
          coordinates: {
            lat: args.lat,
            lng: args.lng,
          },
        },
      ],
    });
  },
});

export const deleteDayInItinerary = mutation({
  args: { dayName: v.string(), planId: v.id("plan") },
  handler: async (ctx, args) => {
    const { subject } = await getIdentityOrThrow(ctx);
    console.log(
      `deleteDayInItinerary called by ${subject} on planId : ${args.planId}`
    );

    const data = await ctx.db.get(args.planId);
    if (!data) return;
    await ctx.db.patch(args.planId, {
      itinerary: data.itinerary.filter((d) => !d.title.includes(args.dayName)),
    });
  },
});

export const addDayInItinerary = mutation({
  args: {
    planId: v.id("plan"),
    itineraryDay: v.object({
      title: v.string(),
      morning: v.array(
        v.object({
          description: v.string(),
          brief: v.string(),
        })
      ),
      afternoon: v.array(
        v.object({
          description: v.string(),
          brief: v.string(),
        })
      ),
      evening: v.array(
        v.object({
          description: v.string(),
          brief: v.string(),
        })
      ),
    }),
  },
  handler: async (ctx, { planId, itineraryDay }) => {
    const { subject } = await getIdentityOrThrow(ctx);
    console.log(`addDayInItinerary called by ${subject} on planId : ${planId}`);

    const data = await ctx.db.get(planId);
    if (!data) return;

    await ctx.db.patch(planId, {
      itinerary: [
        ...data.itinerary,
        { ...itineraryDay, title: `Day ${data.itinerary.length + 1}` },
      ],
    });
  },
});

export const createEmptyPlan = mutation({
  args: {
    placeName: v.string(),
    noOfDays: v.string(),
    activityPreferences: v.array(v.string()),
    fromDate: v.number(),
    toDate: v.number(),
    companion: v.optional(v.string()),
    isGeneratedUsingAI: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);

    const state = !args.isGeneratedUsingAI;

    const newPlan = await ctx.db.insert("plan", {
      nameoftheplace: args.placeName,
      abouttheplace: "",
      adventuresactivitiestodo: [],
      topplacestovisit: [],
      userId: identity.subject,
      userPrompt: `${args.noOfDays} days trip to ${args.placeName}`,
      besttimetovisit: "",
      itinerary: [],
      storageId: null,
      localcuisinerecommendations: [],
      packingchecklist: [],
      isGeneratedUsingAI: args.isGeneratedUsingAI,
      contentGenerationState: {
        imagination: state,
        abouttheplace: state,
        adventuresactivitiestodo: state,
        besttimetovisit: state,
        itinerary: state,
        localcuisinerecommendations: state,
        packingchecklist: state,
        topplacestovisit: state,
      },
    });

    const planId = await ctx.db.insert("planSettings", {
      planId: newPlan,
      userId: identity.subject,
      activityPreferences: args.activityPreferences,
      fromDate: args.fromDate,
      toDate: args.toDate,
      companion: args.companion,
      isPublished: false,
    });

    console.log(
      `createEmptyPlan called by ${identity.subject} on planId : ${planId}`
    );
    return newPlan;
  },
});

export const deletePlan = mutation({
  args: { planId: v.string() },
  async handler(ctx, args) {
    const identity = await getIdentityOrThrow(ctx);
    console.log(
      `deletePlan called by ${identity.subject} on planId : ${args.planId}`
    );
    const planId = args.planId as Id<"plan">;

    const plan = await ctx.db.get(planId);

    if (!plan) {
      throw new ConvexError(
        "There is no such plan to delete with the given Id"
      );
    }

    if (plan.userId !== identity.subject) {
      throw new ConvexError("You are not the owner of this plan.");
    }
    try {
      if (plan.storageId) {
        await ctx.storage.delete(plan.storageId as Id<"_storage">);
      }
    } catch (e) {
      console.log(e);
    }

    const expenseIds = (
      await ctx.db
        .query("expenses")
        .withIndex("by_planId", (q) => q.eq("planId", planId))
        .collect()
    ).map((ex) => ex._id);
    await Promise.all(expenseIds.map((id) => ctx.db.delete(id)));

    const accessIds = (
      await ctx.db
        .query("access")
        .withIndex("by_planId", (q) => q.eq("planId", planId))
        .collect()
    ).map((ex) => ex._id);
    await Promise.all(accessIds.map((id) => ctx.db.delete(id)));

    const inviteIds = (
      await ctx.db
        .query("invites")
        .withIndex("by_planId", (q) => q.eq("planId", planId))
        .collect()
    ).map((ex) => ex._id);
    await Promise.all(inviteIds.map((id) => ctx.db.delete(id)));

    const planSettings = await ctx.db
      .query("planSettings")
      .withIndex("by_planId", (q) => q.eq("planId", planId))
      .unique();
    if (planSettings) await ctx.db.delete(planSettings?._id);

    await ctx.db.delete(planId);
  },
});