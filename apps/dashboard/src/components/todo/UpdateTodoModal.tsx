import { Todo } from "@/generated/graphql";
import { GET_CATEGORIES } from "@/graphql/categories/categoryQueries";
import { UPDATE_TODO } from "@/graphql/todo/todoMutations";
import { GET_TODOS } from "@/graphql/todo/todoQueries";
import { handleGraphQLResponse } from "@/utils/handle-graphql-mutation-response";
import { useMutation, useSuspenseQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Calendar } from "@repo/ui/components/calendar";
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
import { MultiSelect } from "@repo/ui/components/multi-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Textarea } from "@repo/ui/components/textarea";
import { cn } from "@repo/ui/lib/utils";
import {
  TodoUpdateInputSchema,
  type TodoUpdateFormData,
} from "@repo/validation-schema";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TimePicker12Demo } from "../ui/time-picker-demo";

interface UpdateTodoModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateTodoModal({
  todo,
  isOpen,
  onOpenChange,
}: UpdateTodoModalProps) {
  // Fetch categories
  const { data: categoriesData } = useSuspenseQuery(GET_CATEGORIES);
  const categories = categoriesData?.categories?.items || [];

  // Format categories for MultiSelect
  const categoryOptions = categories.map((category) => ({
    label: category?.name || "",
    value: category?.id || "",
    icon: () => {
      return (
        <div
          className="rounded-full h-3 w-3"
          style={{
            backgroundColor: category?.color || "transparent",
          }}
        ></div>
      );
    },
  }));

  // Get currently selected category IDs from the todo
  const currentCategoryIds =
    todo?.categories?.map((category) => category.id) || [];

  const [updateTodo, { loading: updateLoading }] = useMutation(UPDATE_TODO, {
    onError: (error) => {
      console.error("Error updating todo:", error);
      toast.error("Error updating todo: " + error.message);
    },
    refetchQueries: [{ query: GET_TODOS }],
  });

  const form = useForm<TodoUpdateFormData>({
    resolver: zodResolver(TodoUpdateInputSchema),
    defaultValues: {
      id: todo?.id || "",
      title: todo?.title || "",
      content: todo?.content || "",
      dueDate: todo?.dueDate ? new Date(todo.dueDate) : null,
      categoryIds: currentCategoryIds,
    },
    // Update form values when todo changes
    values: {
      id: todo?.id || "",
      title: todo?.title || "",
      content: todo?.content || "",
      dueDate: todo?.dueDate ? new Date(todo.dueDate) : null,
      categoryIds: currentCategoryIds,
    },
  });

  console.log("isValid", form.formState.isValid, form.formState.errors);

  const onSubmit = async (formData: TodoUpdateFormData) => {
    try {
      console.log("Form data:", formData);
      const result = await updateTodo({
        variables: {
          todo: {
            id: formData.id,
            title: formData.title,
            content: formData.content || null,
            dueDate: formData.dueDate,
            categoryIds:
              formData.categoryIds !== undefined ? formData.categoryIds : null,
          },
        },
      });

      // const response = result.data?.updateTodo;

      // if (response?.__typename === "Todo") {
      //   toast.success("Todo updated successfully!");
      //   onOpenChange(false);
      // } else if (response?.__typename === "ValidationError") {
      //   toast.error("Validation error");
      // } else if (response?.__typename === "NotFoundError") {
      //   toast.error("Todo not found");
      // } else if (response?.__typename === "ServerError") {
      //   toast.error("Server error occurred");
      // } else if (response?.__typename === "ConflictError") {
      //   toast.error("Conflict error");
      // } else {
      //   toast.error("An error occurred while updating the todo");
      // }

      handleGraphQLResponse(result.data?.updateTodo, "Todo", "update", {
        onSuccess: () => onOpenChange(false),
        // Optional: customize error messages
        customMessages: {
          // [GraphQLErrorType.NotFoundError]: (error) =>
          //   `Could not find Todo with ID ${error.resourceId}`,
          ValidationError: (error) =>
            `Validation failed: ${error.field || "unknown field"}`,
        },
      });
    } catch (error: any) {
      console.error("Error updating todo:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Todo</DialogTitle>
          <DialogDescription>
            Make changes to your todo item here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter todo title"
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter todo description"
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
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date (optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value instanceof Date ? field.value : undefined
                        }
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                      {field.value && (
                        <div className="p-3 border-t border-border">
                          <TimePicker12Demo
                            date={
                              field.value instanceof Date
                                ? field.value
                                : undefined
                            }
                            setDate={(date) => {
                              field.onChange(date);
                            }}
                          />
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    {categories.length > 0 ? (
                      <MultiSelect
                        options={categoryOptions}
                        defaultValue={field.value ?? []}
                        onValueChange={field.onChange}
                        placeholder="Select categories"
                        className="border rounded-md"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No categories available.
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
