# myTodo: A full-stack Turborepo Monorepo Starter

> NOTE: This README is a work in progress! Some info / commands may be incomplete or missing.

This starter template features a simple Todo application with a GraphQL API and a React dashboard, all built using modern TypeScript practices. It serves as an example of how to structure a full-stack application using Turborepo, pnpm, and TypeScript.

I created this monorepo starter to provide a solid foundation for building full-stack applications with TypeScript, GraphQL, and React. It includes everything you need to get started quickly, while also being flexible enough to adapt to your specific needs.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 10.10.0+
- Docker & Docker Compose

### Installation

```sh
# Clone the repository
git clone <repository-url>
cd monorepo-starter

# Install dependencies
pnpm install

# Start development environment
pnpm dev

# Or start with Docker
pnpm docker:dev
```

## 🏗️ What's Inside?

### Applications

- **`api`**: GraphQL API server built with [Fastify](https://fastify.dev/), [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server), and [Prisma](https://prisma.io)

  - Authentication with [Better Auth](https://better-auth.com/)
  - GraphQL schema with code generation
  - Database migrations and seeding
  - Email integration with [Resend](https://resend.com/)

- **`dashboard`**: React dashboard built with [Vite](https://vitejs.dev/) and [TanStack Router](https://tanstack.com/router)
  - Apollo Client for GraphQL integration
  - Modern UI components with shadcn/ui
  - Form handling with React Hook Form
  - Data tables with TanStack Table

### Packages

- **`@repo/database`**: Shared database layer with Prisma ORM
- **`@repo/emails`**: Email templates built with [Maizzle](https://maizzle.com/)
- **`@repo/ui`**: Shared React component library with shadcn/ui components
- **`@repo/schema`**: GraphQL schema definitions and code generation
- **`@repo/validation-schema`**: Shared validation schemas with Zod
- **`@repo/logger`**: Isomorphic logging utility
- **`@repo/eslint-config`**: ESLint configurations for different project types
- **`@repo/typescript-config`**: TypeScript configurations

## 🛠️ Development

### Available Scripts

```sh
# Development
pnpm dev              # Start all apps in development mode
pnpm build            # Build all apps and packages
pnpm lint             # Lint all projects
pnpm test             # Run all tests
pnpm format           # Format code with Prettier
pnpm check-types      # Type check all projects

# Docker
pnpm docker:dev       # Start development environment with Docker
pnpm docker:prod      # Start production environment with Docker
```

### Database

The project uses PostgreSQL with Prisma ORM:

```sh
# Generate Prisma client
cd packages/database && pnpm db:generate

# Run migrations
cd packages/database && pnpm db:migrate

# Open Prisma Studio
cd apps/api && pnpm studio
```

### Environment Setup

1. Copy `.env.example` to `.env` in the root directory
2. Configure your database connection and other environment variables
3. Run database migrations

## 🏢 Architecture

This monorepo follows modern full-stack patterns:

- **Type-safe**: End-to-end TypeScript with strict configurations
- **GraphQL-first**: Schema-driven API development with code generation
- **Component-driven**: Shared UI components across applications
- **Database-first**: Prisma schema as single source of truth
- **Docker-ready**: Production and development Docker configurations
- **Modern tooling**: Turborepo, pnpm workspaces, and modern React ecosystem

## 🔧 Tech Stack

- **Build System**: [Turborepo](https://turbo.build/repo)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **API**: [Fastify](https://fastify.dev/) + [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)
- **Database**: [PostgreSQL](https://postgresql.org/) + [Prisma](https://prisma.io/)
- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Radix UI](https://radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Email**: [Maizzle](https://maizzle.com/) + [Resend](https://resend.com/)
- **Code Quality**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
- **Testing**: [Jest](https://jestjs.io/) + [Vitest](https://vitest.dev/)
- **Containerization**: [Docker](https://docker.com/)

## 🛠️ Maintenance

These technologies and practices are subject to change as the ecosystem evolves. I will do my best to keep this project up to date with the latest advancements in the TypeScript, GraphQL, and React communities.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Feel free to use, modify, and distribute it as you wish. Contributions are welcome!

---

Built with ❤️ by Marcello Novelli - Github: [mnove](https://github.com/mnove)
