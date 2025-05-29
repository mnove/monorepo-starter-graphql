import { SignInForm } from "@/components/auth/sign-in-form";
import { useAuth } from "@/lib/auth";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated, show landing page with login form
  if (!isAuthenticated) {
    return (
      <div className="py-8">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Todo Dashboard
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Please sign in to access your todos
          </p>
        </div>
        <div className="max-w-md mx-auto">
          <SignInForm />
        </div>
      </div>
    );
  }

  // If authenticated, show the dashboard
  return (
    <div className="py-8">
      <Outlet />
    </div>
  );
}
