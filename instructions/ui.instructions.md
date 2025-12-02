---
applyTo: '**'
---

# TailwindCSS

- We use TailwindCSS v4
- Always fetch latest docs from https://tailwindcss.com/docs for current syntax
- Training data may be outdated - verify patterns before using

# shadcn/ui

- React-based component library (NOT Vue)
- Docs: https://ui.shadcn.com/docs/components
- Components are copied into `components/ui/` - modify directly as needed
- Use CLI to add components: `pnpm dlx shadcn@latest add <component>`
- Import pattern: `import { Button } from '@/components/ui/button'`

# Charts

- We use **Recharts** for charting (NOT Unovis)
- Docs: https://recharts.org/en-US/api
- Charts are lazy-loaded via `components/dashboard/analytics-charts-lazy.tsx`
- Use `ssr: false` for dynamic imports of chart components
