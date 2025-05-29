import {
  BULK_DELETE_CATEGORIES,
  DELETE_CATEGORY,
} from "@/graphql/categories/categoryMutations";
import { GET_CATEGORIES } from "@/graphql/categories/categoryQueries";
import { useMutation, useSuspenseQuery } from "@apollo/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Button } from "@repo/ui/components/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import * as React from "react";
import { toast } from "sonner";
import { CategoryItem } from "./CategoryItem";

export function CategoryList() {
  const { data } = useSuspenseQuery(GET_CATEGORIES);

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

  const [deleteCategory, { loading: deleteLoading }] = useMutation(
    DELETE_CATEGORY,
    {
      onError: (error) => {
        console.error("Error deleting category:", error);
        toast.error("Error deleting category: " + error.message);
      },
      refetchQueries: [{ query: GET_CATEGORIES }],
    }
  );

  const [bulkDeleteCategories, { loading: bulkDeleteLoading }] = useMutation(
    BULK_DELETE_CATEGORIES,
    {
      onError: (error) => {
        console.error("Error deleting categories:", error);
        toast.error("Error deleting categories: " + error.message);
      },
      refetchQueries: [{ query: GET_CATEGORIES }],
    }
  );

  const handleDeleteCategory = async (id: string) => {
    try {
      const result = await deleteCategory({
        variables: { deleteCategoryId: id },
      });

      const response = result.data?.deleteCategory;

      if (response?.__typename === "Category") {
        toast.success("Category deleted successfully!");
      } else if (response?.__typename === "ValidationError") {
        toast.error("Validation error occurred");
      } else if (response?.__typename === "NotFoundError") {
        toast.error("Category not found");
      } else if (response?.__typename === "ServerError") {
        toast.error("Server error occurred");
      } else if (response?.__typename === "UnauthorizedError") {
        toast.error("Unauthorized");
      } else {
        toast.error("An error occurred while deleting the category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  const getCategoryIds = () => {
    return (
      data?.categories?.items
        ?.map((category) => category?.id)
        .filter((id): id is string => id !== undefined) || []
    );
  };

  const handleOpenBulkDeleteDialog = () => {
    const categoryIds = getCategoryIds();

    if (categoryIds.length === 0) {
      toast.info("No categories to delete");
      return;
    }

    setIsAlertOpen(true);
  };

  const handleBulkDelete = async () => {
    try {
      const categoryIds = getCategoryIds();

      const result = await bulkDeleteCategories({
        variables: { ids: categoryIds },
      });

      const responses = result.data?.bulkDeleteCategories;

      if (responses && responses.length > 0) {
        const successCount = responses.filter(
          (r) => r.__typename === "Category"
        ).length;
        toast.success(`Successfully deleted ${successCount} categories`);

        const failedCount = responses.length - successCount;
        if (failedCount > 0) {
          toast.warning(`Failed to delete ${failedCount} categories`);
        }
      }
    } catch (error) {
      console.error("Error bulk deleting categories:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsAlertOpen(false);
    }
  };

  return (
    <section className="mx-auto mt-8 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Categories</h2>
        {data?.categories?.items && data.categories.items.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={handleOpenBulkDeleteDialog}
              disabled={bulkDeleteLoading}
            >
              {bulkDeleteLoading ? "Deleting..." : "Delete All Categories"}
            </Button>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {getCategoryIds().length}{" "}
                    categories. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    disabled={bulkDeleteLoading}
                  >
                    {bulkDeleteLoading ? "Deleting..." : "Delete All"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg bg-background shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Todos</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.categories?.items?.map((category) => (
              <CategoryItem
                key={category?.id}
                category={category as CategoryType}
                onDelete={handleDeleteCategory}
                isDeleting={deleteLoading}
                isUpdating={false}
              />
            ))}
          </TableBody>
          {(!data?.categories?.items || data.categories.items.length === 0) && (
            <TableCaption>
              No categories found. Create your first category!
            </TableCaption>
          )}
        </Table>
      </div>
    </section>
  );
}
