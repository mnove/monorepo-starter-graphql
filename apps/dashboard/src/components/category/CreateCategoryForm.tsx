import { CREATE_CATEGORY } from "@/graphql/categories/categoryMutations";
import { GET_CATEGORIES } from "@/graphql/categories/categoryQueries";
import { handleGraphQLResponse } from "@/utils/handle-graphql-mutation-response";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { ColorPicker } from "@repo/ui/components/color-picker";
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
  CategoryCreateInputSchema,
  type CategoryCreateFormData,
} from "@repo/validation-schema";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function CreateCategoryForm() {
  const [createCategory, { loading: createCategoryLoading }] = useMutation(
    CREATE_CATEGORY,
    {
      onError: (error) => {
        console.error("Error creating category:", error);
        toast.error("Error creating category: " + error.message);
      },
      refetchQueries: [{ query: GET_CATEGORIES }],
    }
  );

  const form = useForm<CategoryCreateFormData>({
    resolver: zodResolver(CategoryCreateInputSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "",
    },
  });

  const onSubmit = async (formData: CategoryCreateFormData) => {
    try {
      const result = await createCategory({
        variables: {
          category: {
            name: formData.name,
            description: formData.description || null,
            color: formData.color || null,
          },
        },
      });

      // const response = result.data?.createCategory;

      // if (response?.__typename === "Category") {
      //   toast.success("Category created successfully!");
      //   form.reset();
      // } else if (response?.__typename === "ValidationError") {
      //   toast.error("Validation error");
      // } else if (response?.__typename === "NotFoundError") {
      //   toast.error("Not found error");
      // } else if (response?.__typename === "ServerError") {
      //   toast.error("Server error occurred");
      // } else if (response?.__typename === "ConflictError") {
      //   toast.error("A category with this name already exists");
      // } else {
      //   toast.error("An error occurred while creating the category");
      // }

      handleGraphQLResponse(result.data?.createCategory, "Category", "create", {
        onSuccess: () => form.reset(),
        customMessages: {
          ConflictError: "A category with this name already exists",
        },
      });
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <section className="mx-auto max-w-4xl rounded-lg bg-background p-6 shadow-md border mb-8">
      <h2 className="mb-4 text-xl font-bold">Create Category</h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <div className="flex flex-row w-full gap-4 justify-between items-start">
            <div className="w-2/3 gap-4 flex flex-col">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
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
            </div>

            <div className="w-1/3 gap-4 flex flex-col">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="#FFFFFF"
                        />
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
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="default"
              size="default"
              disabled={createCategoryLoading}
              className="w-full"
            >
              {createCategoryLoading ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
