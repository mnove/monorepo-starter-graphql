## Emails

This package provides a set of reusable email templates built with Maizzle framework and TypeScript functions for rendering them with variable substitution. It includes transactional emails like user verification, password reset, and user invitations.

## Structure

- **Email templates** are defined using HTML files in the `emails/` directory with Maizzle framework syntax
- **Layouts** are reusable structures in the `layouts/` directory (transactional, report, main)
- **Components** are reusable UI elements in the `components/` directory (button, spacer, footer, etc.)
- **TypeScript functions** in `src/index.ts` provide type-safe email rendering with variable substitution
- **Build output** generates both HTML and TXT versions in the `build_production/` directory

## Build Process

The build process consists of two steps:

1. **Maizzle build** - Compiles HTML templates with Tailwind CSS, inlines styles, and generates both HTML and TXT versions
2. **TypeScript build** - Compiles the TypeScript functions for template rendering with proper type definitions

## Notes

- Templates use `@{{ variableName }}` syntax for variable placeholders that get replaced by TypeScript functions
- Both HTML and TXT versions are automatically generated for all templates
- The package exports both development (TypeScript) and production (compiled) entry points
- CSS is inlined and purged in production builds for maximum email client compatibility
