import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// The /extension page must be public — IDE users land here before they log in
// const isPublicRoute = createRouteMatcher(["/extension(.*)", "/(web)(.*)"]);
const isPublicRoute = createRouteMatcher([
  '/extension(.*)',
  '/auth(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/(web)(.*)',
  '/auth/callback(.*)',
  '/onboard/user(.*)',
])

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
