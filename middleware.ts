import { authMiddleware } from "@clerk/nextjs";

const publicRoutes = [
  "/",
  "/plans/:planId/community-plan(.*)",
  "/community-plans",
  "/api/get-token",
];

export default authMiddleware({
  publicRoutes,
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
