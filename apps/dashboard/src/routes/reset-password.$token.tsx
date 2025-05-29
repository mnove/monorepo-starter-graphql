import { ResetPasswordForm } from "@/components/auth/reset-password";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/reset-password/$token")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      callbackUrl: search.callbackUrl as string,
    };
  },
});

function RouteComponent() {
  return (
    <div className="w-full mx-auto max-w-md py-8">
      <ResetPasswordForm />
    </div>
  );
}
