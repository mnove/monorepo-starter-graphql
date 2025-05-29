export function CategoriesLoading() {
  return (
    <section className="mx-auto mt-8 max-w-4xl">
      <h2 className="mb-4 text-xl font-bold">Categories</h2>
      <div className="overflow-hidden rounded-lg bg-background shadow-md p-8">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="p-4 text-center text-gray-500">
          Loading categories...
        </div>
      </div>
    </section>
  );
}
