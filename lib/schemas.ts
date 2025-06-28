export const batch1Schema = {
    type: "object",
    properties: {
        abouttheplace: { type: "string" },
        besttimetovisit: { type: "string" },
    },
    required: ["abouttheplace", "besttimetovisit"],
};

export const batch2Schema = {
    type: "object",
    properties: {
        adventuresactivitiestodo: {
            type: "array",
            items: { type: "string" },
        },
        localcuisinerecommendations: {
            type: "array",
            items: { type: "string" },
        },
        packingchecklist: {
            type: "array",
            items: { type: "string" },
        },
    },
    required: ["adventuresactivitiestodo", "localcuisinerecommendations", "packingchecklist"],
};

export const batch3Schema = {
    type: "object",
    properties: {
        itinerary: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    morning: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                description: { type: "string" },
                                brief: { type: "string" },
                            },
                            required: ["description", "brief"],
                        },
                    },
                    afternoon: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                description: { type: "string" },
                                brief: { type: "string" },
                            },
                            required: ["description", "brief"],
                        },
                    },
                    evening: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                description: { type: "string" },
                                brief: { type: "string" },
                            },
                            required: ["description", "brief"],
                        },
                    },
                },
                required: ["title", "morning", "afternoon", "evening"],
            },
        },
        topplacestovisit: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    coordinates: {
                        type: "object",
                        properties: {
                            lat: { type: "number" },
                            lng: { type: "number" },
                        },
                        required: ["lat", "lng"],
                    },
                },
                required: ["name", "coordinates"],
            },
        },
    },
    required: ["itinerary", "topplacestovisit"],
}; 