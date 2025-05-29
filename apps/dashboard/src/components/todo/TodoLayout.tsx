import { Suspense } from "react";
import { CreateTodoForm } from "./CreateTodoForm";
import { TodoList } from "./TodoList";
import { TodosLoading } from "./TodosLoading";

export function TodoLayout() {
  return (
    <div className="p-4">
      <CreateTodoForm />
      <Suspense fallback={<TodosLoading />}>
        <TodoList />
      </Suspense>
    </div>
  );
}
