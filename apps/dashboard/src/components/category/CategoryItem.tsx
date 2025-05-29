import { Button } from "@repo/ui/components/button";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { UpdateCategoryModal } from "./UpdateCategoryModal";

interface CategoryType {
  __typename?: "Category";
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  createdAt?: any;
  updatedAt?: any;
  todos?: Array<{ __typename?: "Todo"; id: string }> | null;
}

interface CategoryItemProps {
  category: CategoryType | null;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  isUpdating: boolean;
}

export function CategoryItem({
  category,
  onDelete,
  isDeleting,
  isUpdating,
}: CategoryItemProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  if (!category || !category.id) return null;

  // Create a small colored circle to represent the category color
  const colorCircle = category.color ? (
    <div
      className="w-4 h-4 rounded-full inline-block mr-2"
      style={{ backgroundColor: category.color }}
    ></div>
  ) : null;

  return (
    <>
      <TableRow>
        <TableCell className="flex items-center">
          <span className="font-medium">{category?.name}</span>
        </TableCell>

        <TableCell>{colorCircle}</TableCell>

        <TableCell>
          <span className="text-sm text-gray-500">
            {category?.description || "No description"}
          </span>
        </TableCell>

        <TableCell>
          <span className="text-sm text-gray-500">
            {category.todos?.length || 0} todos
          </span>
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
            onClick={() => onDelete(category.id!)}
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

      <UpdateCategoryModal
        category={category}
        isOpen={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
      />
    </>
  );
}
