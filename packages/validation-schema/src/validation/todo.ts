import { z } from "zod";
import { TodoCreateInput, TodoUpdateInput } from "../generated/graphql";

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

export const TodoCreateInputSchema = z.object<Properties<TodoCreateInput>>({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
  completed: z.boolean().optional(),
  dueDate: z.date().optional(),
  categoryIds: z.array(z.string().nanoid()).optional(),
  // dueDate: z.string().datetime().nullish(),
});

export const TodoUpdateInputSchema = z.object<Properties<TodoUpdateInput>>({
  id: z.string().nanoid(),
  title: z.string().optional(),
  content: z.string().nullish(),
  completed: z.boolean().optional(),
  dueDate: z.date().nullish(),
  categoryIds: z.array(z.string().nanoid()).optional(),
});

export type TodoCreateFormData = z.infer<typeof TodoCreateInputSchema>;
export type TodoUpdateFormData = z.infer<typeof TodoUpdateInputSchema>;
