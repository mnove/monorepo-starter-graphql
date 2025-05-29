import { Suspense } from "react";
import { CreateCategoryForm } from "./CreateCategoryForm";
import { CategoryList } from "./CategoryList";
import { CategoriesLoading } from "./CategoriesLoading";

export function CategoryLayout() {
  return (
    <div className="p-4">
      <CreateCategoryForm />
      <Suspense fallback={<CategoriesLoading />}>
        <CategoryList />
      </Suspense>
    </div>
  );
}
