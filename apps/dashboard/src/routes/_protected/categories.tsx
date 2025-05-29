import { CategoryLayout } from "@/components/category";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/categories")({
  component: RouteComponent,
});

function RouteComponent() {
  // const { isAuthenticated, isLoading } = useAuth();
  // const navigate = useNavigate();

  // // Redirect unauthenticated users to login
  // if (!isLoading && !isAuthenticated) {
  //   navigate({ to: "/login", replace: true });
  //   return null;
  // }

  // // Show loading state
  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[60vh]">
  //       <div className="animate-spin h-10 w-10 border-4 border-primary rounded-full border-t-transparent"></div>
  //     </div>
  //   );
  // }

  return (
    <div>
      <CategoryLayout />
    </div>
  );
}
