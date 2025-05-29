import { Todo } from "@/generated/graphql";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { format } from "date-fns";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { UpdateTodoModal } from "./UpdateTodoModal";

interface TodoItemProps {
  todo: Todo | null;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, currentCompletedState: boolean) => void;
  isDeleting: boolean;
  isUpdating: boolean;
}

export function TodoItem({
  todo,
  onDelete,
  onToggleComplete,
  isDeleting,
  isUpdating,
}: TodoItemProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  if (!todo || !todo.id) return null;

  return (
    <>
      <TableRow>
        <TableCell className="flex items-center gap-3">
          <Checkbox
            id={`todo-${todo.id}`}
            checked={todo.completed}
            disabled={isUpdating}
            onCheckedChange={() => {
              onToggleComplete(todo.id!, todo.completed);
            }}
          />
          <span className={todo.completed ? "line-through text-gray-400" : ""}>
            {todo?.title}
          </span>
        </TableCell>

        <TableCell>
          {todo?.categories?.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full inline-block mr-2"
                style={{ backgroundColor: category.color || "#0000000" }}
              ></div>
              <span className="text-sm ">{category.name}</span>
            </div>
          ))}
        </TableCell>

        <TableCell>
          {todo.dueDate && (
            <span className="text-sm text-gray-500">
              {format(new Date(todo.dueDate), "MMM dd, yyyy hh:mm a")}
            </span>
          )}
        </TableCell>

        <TableCell className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsUpdateModalOpen(true)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(todo.id!)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </Button>
        </TableCell>
      </TableRow>

      <UpdateTodoModal
        todo={todo}
        isOpen={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
      />
    </>
  );
}
