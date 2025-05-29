import { SignUpForm } from "@/components/auth/sign-up-form";
import { useAuth } from "@/lib/auth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (!isLoading && isAuthenticated) {
    navigate({ to: "/todos", replace: true });
    return null;
  }

  return (
    <div className="w-full mx-auto max-w-md py-8">
      <SignUpForm />
    </div>
  );
}
