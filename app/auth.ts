import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

export async function getAuthToken() {
  try {
    // Ensure headers are awaited before using
    await headers();
    
    const token = await auth().getToken({ 
      template: "convex"
    });
    
    if (!token) {
      console.warn("No auth token available");
      return undefined;
    }
    
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return undefined;
  }
}
