import { clerkMiddleware } from "@clerk/nextjs/server";

// See https://clerk.com/docs/references/nextjs/clerk-middleware for more information about configuring your middleware
export default clerkMiddleware(async (auth, req) => {
  // Handle public routes
  const isPublicRoute = [
    "/",
    "/plans/:planId/community-plan(.*)",
    "/community-plans",
    "/api/get-token",
  ].some(pattern => {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return regex.test(req.nextUrl.pathname);
  });

  if (!isPublicRoute) {
    await auth.protect();
  }
}, { debug: true });

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(html?|css|js|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};