import { UPDATE_CATEGORY } from "@/graphql/categories/categoryMutations";
import { GET_CATEGORIES } from "@/graphql/categories/categoryQueries";
import { handleGraphQLResponse } from "@/utils/handle-graphql-mutation-response";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { ColorPicker } from "@repo/ui/components/color-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import {
  CategoryUpdateInputSchema,
  type CategoryUpdateFormData,
} from "@repo/validation-schema";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

interface UpdateCategoryModalProps {
  category: CategoryType | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateCategoryModal({
  category,
  isOpen,
  onOpenChange,
}: UpdateCategoryModalProps) {
  const [updateCategory, { loading: updateLoading }] = useMutation(
    UPDATE_CATEGORY,
    {
      onError: (error) => {
        console.error("Error updating category:", error);
        toast.error("Error updating category: " + error.message);
      },
      refetchQueries: [{ query: GET_CATEGORIES }],
    }
  );

  const form = useForm<CategoryUpdateFormData>({
    resolver: zodResolver(CategoryUpdateInputSchema),
    defaultValues: {
      id: category?.id || "",
      name: category?.name || "",
      description: category?.description || "",
      color: category?.color || "",
    },
    // Update form values when category changes
    values: {
      id: category?.id || "",
      name: category?.name || "",
      description: category?.description || "",
      color: category?.color || "",
    },
  });

  const onSubmit = async (formData: CategoryUpdateFormData) => {
    try {
      const result = await updateCategory({
        variables: {
          category: {
            id: formData.id,
            name: formData.name,
            description: formData.description || null,
            color: formData.color || null,
          },
        },
      });

      // const response = result.data?.updateCategory;

      // if (response?.__typename === "Category") {
      //   toast.success("Category updated successfully!");
      //   onOpenChange(false);
      // } else if (response?.__typename === "ValidationError") {
      //   toast.error("Validation error");
      // } else if (response?.__typename === "NotFoundError") {
      //   toast.error("Category not found");
      // } else if (response?.__typename === "ServerError") {
      //   toast.error("Server error occurred");
      // } else if (response?.__typename === "ConflictError") {
      //   toast.error("A category with this name already exists");
      // } else {
      //   toast.error("An error occurred while updating the category");
      // }

      handleGraphQLResponse(result.data?.updateCategory, "Category", "update", {
        onSuccess: () => {
          onOpenChange(false);
        },
        customMessages: {
          ConflictError: "A category with this name already exists",
        },
      });
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Make changes to your category here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {" "}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category name"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter category description"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dots Color</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <ColorPicker
                      value={field.value || ""}
                      onChange={field.onChange}
                      className="w-10 h-10 rounded-md border cursor-pointer"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter color value"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateLoading}>
                {updateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
