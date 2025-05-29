import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // If not authenticated, redirect to sign in page
  if (!isLoading && !isAuthenticated) {
    navigate({ to: "/sign-in", replace: true });
    return null;
  }
  // Show loading state

  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}
