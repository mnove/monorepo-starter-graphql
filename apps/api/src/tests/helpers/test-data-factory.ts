import { PrismaClient } from "@repo/database";

export class TestDataFactory {
  constructor(private prisma: PrismaClient) {}

  async createTodo(
    userId: string,
    data: Partial<{
      title: string;
      content: string;
      completed: boolean;
      dueDate: Date;
    }> = {}
  ) {
    const defaultData = {
      title: "Test Todo",
      content: "Test todo content",
      completed: false,
      ...data,
    };

    return await this.prisma.todo.create({
      data: {
        ...defaultData,
        authorId: userId,
      },
      include: {
        author: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async createCategory(
    userId: string,
    data: Partial<{
      name: string;
      description: string;
      color: string;
    }> = {}
  ) {
    const defaultData = {
      name: "Test Category",
      description: "Test category description",
      color: "#FF5733",
      ...data,
    };

    return await this.prisma.category.create({
      data: {
        ...defaultData,
        authorId: userId,
      },
      include: {
        author: true,
        todos: {
          include: {
            todo: true,
          },
        },
      },
    });
  }

  async createTodoWithCategories(
    userId: string,
    todoData: Partial<{
      title: string;
      content: string;
      completed: boolean;
    }> = {},
    categoryNames: string[] = ["Work", "Personal"]
  ) {
    // Create categories first
    const categories = await Promise.all(
      categoryNames.map((name) => this.createCategory(userId, { name }))
    );

    // Create todo
    const todo = await this.createTodo(userId, todoData);

    // Connect todo to categories
    await Promise.all(
      categories.map((category) =>
        this.prisma.categoriesOnTodos.create({
          data: {
            todoId: todo.id,
            categoryId: category.id,
          },
        })
      )
    );

    // Return todo with categories
    return await this.prisma.todo.findUnique({
      where: { id: todo.id },
      include: {
        author: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async createMultipleTodos(
    userId: string,
    count: number = 3,
    baseData: Partial<{
      title: string;
      content: string;
      completed: boolean;
    }> = {}
  ) {
    const todos = [];

    for (let i = 0; i < count; i++) {
      const todo = await this.createTodo(userId, {
        title: `${baseData.title || "Test Todo"} ${i + 1}`,
        content: `${baseData.content || "Test content"} ${i + 1}`,
        ...baseData,
      });
      todos.push(todo);
    }

    return todos;
  }

  async createMultipleCategories(
    userId: string,
    count: number = 3,
    baseData: Partial<{
      name: string;
      description: string;
      color: string;
    }> = {}
  ) {
    const categories = [];

    for (let i = 0; i < count; i++) {
      const category = await this.createCategory(userId, {
        name: `${baseData.name || "Test Category"} ${i + 1}`,
        description: `${baseData.description || "Test description"} ${i + 1}`,
        ...baseData,
      });
      categories.push(category);
    }

    return categories;
  }
}
