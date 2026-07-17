import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, Navigate, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import faviconUrl from "../assets/ace-mini-icon.png";
import { FavoritesProvider } from "../lib/favorites";
import { AuthProvider, useAuth } from "../lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const PUBLIC_ROUTES = ["/login", "/register"];

function RouteGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = router.state.location.pathname;

  const isPublic = PUBLIC_ROUTES.some((r) => path === r);
  const isAdminRoute = path.startsWith("/admin");

  if (loading && !isPublic) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (user) {
    if (user.type === "admin" && !isAdminRoute && !isPublic) {
      return <Navigate to="/admin" />;
    }
    if (user.type !== "admin" && isAdminRoute) {
      return <Navigate to="/" />;
    }
  }

  return <Outlet />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (link) {
      link.href = faviconUrl;
    } else {
      const el = document.createElement("link");
      el.rel = "icon";
      el.type = "image/png";
      el.href = faviconUrl;
      document.head.appendChild(el);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>
          <RouteGuard />
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
