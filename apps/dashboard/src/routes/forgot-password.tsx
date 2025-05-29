import { ForgotPasswordForm } from "@/components/auth/forgot-password";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full mx-auto max-w-md py-8">
      <ForgotPasswordForm />
    </div>
  );
}
