import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { defineMiddleware, sequence } from 'astro:middleware';

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)', '/api/dashboard(.*)']);

const dashboardGuard = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  // Only run Clerk on dashboard routes
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname.startsWith('/api/dashboard')) {
    return clerkMiddleware((auth, ctx) => {
      const { isAuthenticated, redirectToSignIn } = auth();
      if (!isAuthenticated) {
        if (pathname.startsWith('/api/')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return redirectToSignIn();
      }
    })(context, next);
  }

  return next();
});

export const onRequest = dashboardGuard;
