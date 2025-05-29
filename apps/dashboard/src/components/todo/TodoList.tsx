import {
  BULK_DELETE_TODOS,
  DELETE_TODO,
  UPDATE_TODO,
} from "@/graphql/todo/todoMutations";
import { GET_TODOS } from "@/graphql/todo/todoQueries";
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
import { TodoItem } from "./TodoItem";
import { PaginationControls } from "./PaginationControls";

export function TodoList() {
  const [pageSize, setPageSize] = React.useState(10);
  const [after, setAfter] = React.useState<string | null>(null);
  const [before, setBefore] = React.useState<string | null>(null);
  const [isPreviousData, setIsPreviousData] = React.useState(false);

  // Store cursors for efficient navigation
  const [cursors, setCursors] = React.useState<{
    startCursor: string | null;
    endCursor: string | null;
    previousStartCursor: string | null;
  }>({
    startCursor: null,
    endCursor: null,
    previousStartCursor: null,
  });

  const { data, fetchMore } = useSuspenseQuery(GET_TODOS, {
    variables: {
      first: pageSize,
      after: after,
      filter: {},
    },
    // This helps with preserving query behavior after mutations
    fetchPolicy: "cache-and-network",
  });

  const [deleteTodo, { loading: deleteLoading }] = useMutation(DELETE_TODO, {
    onError: (error) => {
      console.error("Error deleting todo:", error);
      toast.error("Error deleting todo: " + error.message);
    },
    update: (_cache, result) => {
      if (result.data?.deleteTodo.__typename === "Todo") {
        // Re-fetch with current pagination parameters
        refetchTodos();
      }
    },
  });

  const [updateTodo, { loading: updateLoading }] = useMutation(UPDATE_TODO, {
    onError: (error) => {
      console.error("Error updating todo:", error);
      toast.error("Error updating todo: " + error.message);
    },
    update: (_cache, result) => {
      if (result.data?.updateTodo.__typename === "Todo") {
        // Re-fetch with current pagination parameters
        refetchTodos();
      }
    },
  });

  const [bulkDeleteTodos, { loading: bulkDeleteLoading }] = useMutation(
    BULK_DELETE_TODOS,
    {
      onError: (error) => {
        console.error("Error deleting todos:", error);
        toast.error("Error deleting todos: " + error.message);
      },
      update: (_cache, _result) => {
        // Re-fetch with current pagination parameters
        refetchTodos();
      },
    }
  );

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  // Save pageInfo on each data update
  React.useEffect(() => {
    if (data?.todos?.connection?.pageInfo) {
      const { startCursor, endCursor } = data.todos.connection.pageInfo;

      // Handle cases where cursors might be undefined
      const validStartCursor = startCursor || null;
      const validEndCursor = endCursor || null;

      setCursors((prev) => ({
        startCursor: validStartCursor,
        endCursor: validEndCursor,
        previousStartCursor: before
          ? validStartCursor
          : prev.previousStartCursor,
      }));

      setIsPreviousData(false);
    }
  }, [data, before]);

  // Handle pagination actions
  const handleNextPage = () => {
    // Don't perform the action if we don't have a valid cursor
    if (!cursors.endCursor) {
      return;
    }

    setIsPreviousData(true);
    setBefore(null);
    setAfter(cursors.endCursor);
    fetchMore({
      variables: {
        first: pageSize,
        after: cursors.endCursor,
        last: null,
        before: null,
      },
    }).catch((error) => {
      // Handle errors during pagination
      console.error("Error fetching next page:", error);
      toast.error("Failed to load next page");
      setIsPreviousData(false);
    });
  };

  const handlePreviousPage = () => {
    // Don't perform the action if we don't have a valid cursor
    if (!cursors.startCursor) {
      return;
    }

    setIsPreviousData(true);
    setAfter(null);
    setBefore(cursors.startCursor);
    fetchMore({
      variables: {
        first: null,
        after: null,
        last: pageSize,
        before: cursors.startCursor,
      },
    }).catch((error) => {
      // Handle errors during pagination
      console.error("Error fetching previous page:", error);
      toast.error("Failed to load previous page");
      setIsPreviousData(false);
    });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    // Reset pagination state
    setAfter(null);
    setBefore(null);
    fetchMore({
      variables: {
        first: newSize,
        after: null,
        last: null,
        before: null,
      },
    });
  };

  // Refetch todos with current pagination state
  const refetchTodos = () => {
    setIsPreviousData(true);
    fetchMore({
      variables: {
        first: before ? null : pageSize,
        after: before ? null : after,
        last: before ? pageSize : null,
        before: before,
      },
    })
      .catch((error) => {
        console.error("Error refetching todos:", error);
        toast.error("Failed to refresh todo list");
        setIsPreviousData(false);
      })
      .finally(() => {
        setIsPreviousData(false);
      });
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const result = await deleteTodo({
        variables: { id },
      });

      const response = result.data?.deleteTodo;

      if (response?.__typename === "Todo") {
        toast.success("Todo deleted successfully!");
      } else if (response?.__typename === "ValidationError") {
        toast.error("Validation error occurred");
      } else if (response?.__typename === "NotFoundError") {
        toast.error("Todo not found");
      } else if (response?.__typename === "ServerError") {
        toast.error("Server error occurred");
      } else if (response?.__typename === "UnauthorizedError") {
        toast.error("Unauthorized");
      } else {
        toast.error("An error occurred while deleting the todo");
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleToggleTodoCompletion = async (
    id: string,
    currentCompletedState: boolean
  ) => {
    try {
      const result = await updateTodo({
        variables: {
          todo: {
            id,
            completed: !currentCompletedState,
          },
        },
      });

      const response = result.data?.updateTodo;

      if (response?.__typename === "Todo") {
        toast.success(
          `Todo ${response.completed ? "completed" : "marked as incomplete"}!`
        );
      } else if (response?.__typename === "ValidationError") {
        toast.error("Validation error occurred");
      } else if (response?.__typename === "NotFoundError") {
        toast.error("Todo not found");
      } else if (response?.__typename === "ServerError") {
        toast.error("Server error occurred");
      } else {
        toast.error("An error occurred while updating the todo");
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const getTodoIds = () => {
    return (
      data?.todos?.connection?.edges
        ?.map((edge) => edge?.node?.id)
        .filter((id): id is string => id !== undefined) || []
    );
  };

  const handleOpenBulkDeleteDialog = () => {
    const todoIds = getTodoIds();

    if (todoIds.length === 0) {
      toast.info("No todos to delete");
      return;
    }

    setIsAlertOpen(true);
  };

  const handleBulkDelete = async () => {
    try {
      const todoIds = getTodoIds();

      const result = await bulkDeleteTodos({
        variables: { ids: todoIds },
      });

      const responses = result.data?.bulkDeleteTodos;

      if (responses && responses.length > 0) {
        const successCount = responses.filter(
          (r) => r.__typename === "Todo"
        ).length;
        toast.success(`Successfully deleted ${successCount} todos`);

        const failedCount = responses.length - successCount;
        if (failedCount > 0) {
          toast.warning(`Failed to delete ${failedCount} todos`);
        }
      }
    } catch (error) {
      console.error("Error bulk deleting todos:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsAlertOpen(false);
    }
  };

  // Loading indicator for pagination transitions
  const renderLoadingIndicator = () => {
    if (isPreviousData) {
      return (
        <div className="py-2 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      );
    }
    return null;
  };

  console.log("datapageinfo", data.todos?.connection?.pageInfo);

  return (
    <section className="mx-auto mt-8 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Todos</h2>
        {data?.todos?.connection?.edges &&
          data.todos.connection.edges.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={handleOpenBulkDeleteDialog}
                disabled={bulkDeleteLoading}
              >
                {bulkDeleteLoading ? "Deleting..." : "Delete All Todos"}
              </Button>

              <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {getTodoIds().length}{" "}
                      todos. This action cannot be undone.
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
        {renderLoadingIndicator()}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.todos?.connection?.edges?.map((edge) => (
              <TodoItem
                key={edge.node.id}
                todo={edge.node}
                onDelete={handleDeleteTodo}
                onToggleComplete={handleToggleTodoCompletion}
                isDeleting={deleteLoading}
                isUpdating={updateLoading}
              />
            ))}
          </TableBody>
          {(!data?.todos?.connection?.edges ||
            data.todos.connection.edges.length === 0) && (
            <TableCaption>No todos found. Create your first todo!</TableCaption>
          )}
        </Table>

        {data?.todos?.connection && (
          <PaginationControls
            hasNextPage={data.todos.connection.pageInfo.hasNextPage}
            hasPreviousPage={data.todos.connection.pageInfo.hasPreviousPage}
            startCursor={data.todos.connection.pageInfo.startCursor || null}
            endCursor={data.todos.connection.pageInfo.endCursor || null}
            pageSize={pageSize}
            totalCount={data.todos.connection.totalCount}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </section>
  );
}
