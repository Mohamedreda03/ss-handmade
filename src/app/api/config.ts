/**
 * Global configuration for API routes
 * This ensures all API routes are processed dynamically at runtime
 * rather than being statically generated during build time
 */

// Force all routes in the API directory to be dynamic
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
