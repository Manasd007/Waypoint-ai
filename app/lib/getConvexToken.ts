import { auth } from "@clerk/nextjs/server";

export async function getConvexToken() {
  try {
    const { sessionId, getToken } = await auth();
    if (!sessionId) {
      console.warn("No session available");
      return null;
    }
    return await getToken({ template: "convex" });
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
} 