/**
 * Global dynamic configuration for Next.js app router
 *
 * This file exports configuration settings that will be applied to all
 * routes in the application to prevent static generation issues.
 */

// Check if we should force all routes to be dynamic
const shouldForceAllDynamic = process.env.NEXT_PUBLIC_FORCE_DYNAMIC === "true";

// Export dynamic directive that can be used by all routes
export const dynamic = shouldForceAllDynamic ? "force-dynamic" : undefined;
export const runtime = "nodejs";
