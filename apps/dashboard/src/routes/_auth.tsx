import { useAuth } from "@/lib/auth";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // If authenticated already, redirect to dashboard
  if (!isLoading && isAuthenticated) {
    navigate({ to: "/todos", replace: true });
    return null;
  }

  return (
    <>
      <Outlet />
    </>
  );
}
