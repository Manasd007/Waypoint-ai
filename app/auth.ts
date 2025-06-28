import { auth } from "@clerk/nextjs/server";

export async function getAuthToken() {
  try {
    const { sessionId, getToken } = await auth();
    if (!sessionId) {
      console.warn("No session available");
      return undefined;
    }
    return await getToken({ template: "convex" });
  } catch (error) {
    console.error("Auth error:", error);
    return undefined;
  }
}