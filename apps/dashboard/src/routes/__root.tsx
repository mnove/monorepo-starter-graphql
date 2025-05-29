import ErrorBoundary from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@repo/ui/components/sonner";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Suspense } from "react";

// Loading fallback component for the root level suspense
function RootFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin h-10 w-10 border-4 border-primary rounded-full border-t-transparent"></div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TanStackRouterDevtools />
        <Toaster richColors />
        <ErrorBoundary>
          <Suspense fallback={<RootFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </ThemeProvider>
    </AuthProvider>
  );
}
