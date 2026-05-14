import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// The /extension page must be public — IDE users land here before they log in
const isPublicRoute = createRouteMatcher(["/extension(.*)", "/(web)(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
