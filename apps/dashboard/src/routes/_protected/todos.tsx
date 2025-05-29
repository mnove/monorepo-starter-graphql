import { TodoLayout } from "@/components/todo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/todos")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <TodoLayout />
    </div>
  );
}
