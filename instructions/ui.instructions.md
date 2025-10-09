---
applyTo: '**'
---

# TailwindCSS

- We use tailwindcss@4.
- Always use the fetch tool to look up the latest component usage, install name, and best practices directly from the official tailwind documentation: https://tailwindcss.com/docs
- Do not rely on what you think you know about tailwindcss, as they are frequently updated and improved. Your training data is outdated.

# shadcn-vue UI Development

- Always use the fetch tool to look up the latest component usage, install name, and best practices directly from the official shadcn-vue/ui documentation: https://www.shadcn-vue.com/docs/components/
- Do not rely on what you think you know about shadcn-vue/ui components, as they are frequently updated and improved. Your training data is outdated.
- For any shadcn-vue/ui component, CLI command, or usage pattern, fetch the relevant page from the docs and follow the instructions there.

**Core Principles:**

- shadcn-vue/ui components are open code: you are expected to read, modify, and extend them directly.
- Use the CLI (`pnpm dlx shadcn@latest add <component>`) to add or update components.
- Always import from the local `@/components/ui/<component>` path.
- Follow accessibility and composition best practices as described in the docs.

**Summary:**

> For all shadcn/ui work, always use the fetch tool to look up the latest component documentation and usage from https://ui.shadcn.com/docs/components. Do not rely on static instructions.

# charts

- Use @unovis/vue for any graphing or charting needs
- Always use the fetch tool to look up the latest component usage, install name, and best practices directly from the official @unovis/vue documentation: https://unovis.dev/docs/category/component-reference
- Do not rely on what you think you know about @unovis/vue components, as they are frequently updated and improved. Your training data is outdated.
- For any @unovis/vue component, CLI command, or usage pattern, fetch the relevant page from the docs and follow the instructions there.
