import { z } from "zod";
// import { CategoryCreateInput, CategoryUpdateInput } from "../generated/graphql";
import { CategoryCreateInput, CategoryUpdateInput } from "@repo/schema";
type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

export const CategoryCreateInputSchema = z.object<
  Properties<CategoryCreateInput>
>({
  name: z.string().min(1, { message: "Name for category is required" }),
  description: z.string().nullish(),
  color: z.string().nullish(),
});

export const CategoryUpdateInputSchema = z.object<
  Properties<CategoryUpdateInput>
>({
  id: z.string().nanoid({ message: "Id for category is required" }),
  name: z.string().optional(),
  description: z.string().nullish(),
  color: z.string().nullish(),
});

export type CategoryCreateFormData = z.infer<typeof CategoryCreateInputSchema>;
export type CategoryUpdateFormData = z.infer<typeof CategoryUpdateInputSchema>;
