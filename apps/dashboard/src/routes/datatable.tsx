import DemoDataTablePage from "@/components/datatable/page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/datatable")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <DemoDataTablePage />
    </div>
  );
}
