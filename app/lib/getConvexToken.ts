import { auth } from "@clerk/nextjs/server";

export async function getConvexToken() {
  return (await auth().getToken({ template: "convex" })) ?? null;
} 