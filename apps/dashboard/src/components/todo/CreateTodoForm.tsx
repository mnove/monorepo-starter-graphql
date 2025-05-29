import { GET_CATEGORIES } from "@/graphql/categories/categoryQueries";
import { CREATE_TODO } from "@/graphql/todo/todoMutations";
import { GET_TODOS } from "@/graphql/todo/todoQueries";
import {
  GraphQLErrorType,
  handleGraphQLResponse,
} from "@/utils/handle-graphql-mutation-response";
import { useMutation, useSuspenseQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Calendar } from "@repo/ui/components/calendar";
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
  TodoCreateInputSchema,
  type TodoCreateFormData,
} from "@repo/validation-schema";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TimePicker12Demo } from "../ui/time-picker-demo";

import { useApolloClient } from "@apollo/client";

export function CreateTodoForm() {
  // Fetch categories for the dropdown
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

  // Get the current Apollo Client to access the cache for pagination state
  const client = useApolloClient();

  const [createTodo, { loading: createTodoLoading }] = useMutation(
    CREATE_TODO,
    {
      onError: (error) => {
        console.error("Error creating todo:", error);
        toast.error("Error creating todo: " + error.message);
      },
      // Instead of simple refetch, we'll update the cache properly
      update: (_cache, result) => {
        if (result.data?.createTodo.__typename === "Todo") {
          // Reset the pagination state and refetch the first page
          // This ensures consistent behavior after adding a new item
          client.refetchQueries({
            include: [GET_TODOS],
            updateCache(cache) {
              // Clear any pagination variables in the cache
              cache.modify({
                fields: {
                  todos(_, { DELETE }) {
                    return DELETE;
                  },
                },
              });
            },
          });
        }
      },
    }
  );

  const form = useForm<TodoCreateFormData>({
    resolver: zodResolver(TodoCreateInputSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryIds: [],
    },
  });

  const onSubmit = async (formData: TodoCreateFormData) => {
    try {
      const result = await createTodo({
        variables: {
          todo: {
            title: formData.title,
            dueDate: formData.dueDate,
            content: formData.content,
            categoryIds: formData.categoryIds?.length
              ? formData.categoryIds
              : undefined,
          },
        },
      });

      // const response = result.data?.createTodo;

      // if (response?.__typename === "Todo") {
      //   toast.success("Todo created successfully!");
      //   form.reset();
      // } else if (response?.__typename === "ValidationError") {
      //   toast.error("Validation error");
      // } else if (response?.__typename === "ConflictError") {
      //   toast.error("A todo with this title already exists");
      // } else {
      //   toast.error("An error occurred while creating the todo");
      // }

      handleGraphQLResponse(result.data?.createTodo, "Todo", "create", {
        onSuccess: () => form.reset(),
        customMessages: {
          [GraphQLErrorType.ConflictError]:
            "A todo with this title already exists",
        },
      });
    } catch (error: any) {
      console.error("Error creating todo:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <section className="mx-auto max-w-4xl rounded-lg bg-background p-6 shadow-md border mb-8">
      <h2 className="mb-4 text-xl font-bold">Create Todo</h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <div className="flex flex-row w-full gap-4 justify-between items-start">
            <div className="w-2/3 gap-4 flex flex-col">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter title"
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
                    <FormLabel>Content (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter content..."
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-left">DateTime</FormLabel>
                    <Popover>
                      <FormControl>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[280px] justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP HH:mm:ss")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            field.value instanceof Date
                              ? field.value
                              : undefined
                          }
                          onSelect={field.onChange}
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <TimePicker12Demo
                            setDate={field.onChange}
                            date={
                              field.value instanceof Date
                                ? field.value
                                : undefined
                            }
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        {categories.length > 0 ? (
                          <MultiSelect
                            options={categoryOptions}
                            defaultValue={field.value || undefined}
                            onValueChange={field.onChange}
                            placeholder="Select categories"
                            className="border rounded-md"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground flex items-center">
                            No categories available.
                            <Link
                              to="/categories"
                              className="ml-2 text-primary flex items-center hover:underline"
                            >
                              <PlusIcon className="h-3 w-3 mr-1" />
                              Create category
                            </Link>
                          </div>
                        )}
                      </FormControl>
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
              disabled={createTodoLoading}
              className="w-full"
            >
              {createTodoLoading ? "Creating..." : "Create Todo"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
