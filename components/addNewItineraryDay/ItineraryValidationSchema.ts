import { z } from "zod";

export const ItineraryValidationSchema = z.object({
    itinerary: z.object({
        title: z.string(),
        morning: z.array(
            z.object({
                description: z.string().min(3),
                brief: z.string().min(3),
            })
        ),
        afternoon: z.array(
            z.object({
                description: z.string().min(3),
                brief: z.string().min(3),
            })
        ),
        evening: z.array(
            z.object({
                description: z.string().min(3),
                brief: z.string().min(3),
            })
        ),
    }),
});