# Tailwind Configuration — **HelixIntel**

Agent-oriented checklist to configure Tailwind for a Next.js + shadcn/ui + Prisma/SQLite project. **No shell commands**—only files to create/edit and acceptance criteria. Includes **HelixIntel branding**.

---

## 0) Brand snapshot (apply throughout)

- **Company name**: **HelixIntel** (exact casing)
- **Primary**: `#216093` (brand blue) on `#FFFFFF` (white)
- **Secondary**: `#001B48`, `#57949A`, `#F9FAFA`, `#000000`
- **Tertiary**: `#E18331`, `#2E933C`, `#DB162F`, `#224870`, `#F0C319`
- **Typography**: **Inter** — headings **900**, body **400**

---

## 1) Tailwind config file

**Create** `tailwind.config.ts` with HelixIntel tokens and shadcn conventions.

**Specification:**

- `darkMode: 'class'`
- `content` globs: `./app/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`, `./components/ui/**/*.{ts,tsx}`, `./lib/**/*.{ts,tsx}`
- `theme.container`: `{ center: true, padding: '2rem', screens: { '2xl': '1400px' } }`
- `theme.extend.colors`: map to CSS variables (HSL) **aligned to HelixIntel palette**
- `theme.extend.fontFamily.sans`: `['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif']`
- `theme.extend.borderRadius`: tie to `--radius`
- `theme.extend.keyframes` & `animation`: `accordion-down` / `accordion-up` for shadcn
- `plugins`: `tailwindcss-animate`, `@tailwindcss/forms` (minimal), `@tailwindcss/typography` (optional)

**Reference content (drop-in):**

```ts
// tailwind.config.ts (HelixIntel branded)
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './components/ui/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        // Core roles (shadcn convention) mapped to HelixIntel brand tokens
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))', // #216093
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))', // light surface (e.g., #F9FAFA)
          foreground: 'hsl(var(--secondary-foreground))', // dark text
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))', // #DB162F
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))', // accent teal #57949A
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Additional HelixIntel semantic colors (optional but handy)
        success: 'hsl(var(--success))', // #2E933C
        warning: 'hsl(var(--warning))', // #F0C319 or #E18331
        info: 'hsl(var(--info))', // #224870
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
export default config
```

**Acceptance:** shadcn components render with brand tokens, container widths match spec, animations work.

---

## 2) Global stylesheet & CSS variables (brand mapping)

**Edit** `app/globals.css` to include Tailwind layers and define **light** & **dark** tokens using HelixIntel colors.

> The variables store HSL triplets (e.g., `206.8 63.3% 35.3%`) so `hsl(var(--token))` works.

**Reference content (drop-in):**

```css
/* app/globals.css — HelixIntel brand tokens */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Core surfaces */
    --background: 0 0% 100%; /* #FFFFFF */
    --foreground: 217.5 100% 14.1%; /* #001B48 */

    --card: 0 0% 100%; /* white cards */
    --card-foreground: 217.5 100% 14.1%;

    --popover: 0 0% 100%;
    --popover-foreground: 217.5 100% 14.1%;

    /* Brand primary */
    --primary: 206.8 63.3% 35.3%; /* #216093 */
    --primary-foreground: 0 0% 100%; /* white text on brand */

    /* Secondary & UI states */
    --secondary: 180 9.1% 97.8%; /* #F9FAFA light surface */
    --secondary-foreground: 217.5 100% 14.1%;

    --muted: 210 40% 96%; /* subtle bg */
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 185.4 27.8% 47.3%; /* #57949A teal accents */
    --accent-foreground: 0 0% 100%;

    --destructive: 352.4 81.7% 47.3%; /* #DB162F */
    --destructive-foreground: 0 0% 100%;

    /* Inputs & outlines */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 206.8 63.3% 35.3%; /* brand ring */

    /* Geometry */
    --radius: 0.75rem;

    /* Extra semantic colors (optional) */
    --success: 128.3 52.3% 37.8%; /* #2E933C */
    --warning: 47.4 87.8% 52%; /* #F0C319 */
    --info: 210.8 53.4% 28.6%; /* #224870 */
  }

  .dark {
    /* Dark surfaces */
    --background: 217.5 100% 14.1%; /* #001B48 */
    --foreground: 0 0% 100%; /* white */

    --card: 217.5 100% 14.1%;
    --card-foreground: 0 0% 100%;

    --popover: 217.5 100% 14.1%;
    --popover-foreground: 0 0% 100%;

    /* Brand primary remains the same for consistency */
    --primary: 206.8 63.3% 35.3%; /* #216093 */
    --primary-foreground: 0 0% 100%;

    /* Secondary & UI states */
    --secondary: 210.8 53.4% 28.6%; /* #224870 for dark surfaces */
    --secondary-foreground: 0 0% 100%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 185.4 27.8% 47.3%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 85.7% 97.3%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 206.8 63.3% 35.3%;

    --success: 128.3 52.3% 37.8%;
    --warning: 47.4 87.8% 52%;
    --info: 210.8 53.4% 28.6%;
  }

  /* Base application of tokens */
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Acceptance:** Toggling `<html class="dark">` switches themes; buttons, inputs, dialogs use ring and tokens consistently.

---

## 3) Utility helper for class composition

**Create** `lib/utils.ts` with a `cn()` function combining `clsx` + `tailwind-merge` to avoid conflicting utilities. Used by shadcn components.

**Reference content:**

```ts
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Acceptance:** Components using `cn()` render correctly without duplicate style conflicts.

---

## 4) Inter font — HelixIntel typography

**Goal:** Inter as the app font, with **900** for headings and **400** for body.

**Steps:**

1. In `app/layout.tsx`, import Inter via Next Fonts and expose as `--font-sans` CSS variable.
2. Apply the variable to `<html>` or `<body>` and ensure Tailwind `fontFamily.sans` uses it.
3. Create a base typography rule so headings default to `font-black` (900) and body uses normal (400).

**Reference content:**

```tsx
// app/layout.tsx (excerpt)
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '900'],
  variable: '--font-sans',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

```css
/* app/globals.css (add to @layer base) */
@layer base {
  h1,
  h2,
  h3,
  h4 {
    @apply font-black;
  } /* Inter 900 */
  p,
  li,
  span,
  body {
    font-weight: 400;
  } /* Inter 400 */
}
```

**Acceptance:** All text uses Inter; headings render bold (900), body text normal (400).

---

## 5) shadcn/ui alignment with tokens

**Do:**

- Generate only needed components into `components/ui/*`.
- Ensure components reference tokens (no hard-coded hex). E.g., button variants use `bg-primary` / `text-primary-foreground`.
- Keep `tailwindcss-animate` plugin present; animated components (Dialog, Dropdown) should play smoothly.

**Acceptance:** Buttons/Inputs/Dialogs render correctly in light & dark, with focus rings using brand blue.

---

## 6) Tailwind linting & formatting

**Do:**

- Enable Prettier Tailwind plugin so class lists are auto-sorted.
- (Optional) Add `eslint-plugin-tailwindcss` with rules to catch typos/unknown utilities.

**Acceptance:** On save/commit, class orders are consistent; invalid Tailwind classes are flagged.

---

## 7) Verification artifacts

**Create:**

- **Storybook tokens story** showcasing: color swatches (background/foreground/primary/secondary/muted/accent/destructive + success/warning/info), spacing scale, radius, focus rings, and a dark-mode toggle.
- **/style-check page** rendering: a button matrix (variants/sizes), inputs with error, a dialog open/close, and sample typography.

**Acceptance:** Visual pass in both themes; tokens behave as documented; focus and keyboard navigation are correct.

---

## 8) Optional: safelist policy

If dynamic class names are constructed from data (e.g., `bg-${color}-500`), define a `safelist` or regex in `tailwind.config.ts`. Prefer enumerated variants via CVA to avoid safelists.

**Acceptance:** No missing styles at runtime due to dynamic class generation.

---

## Final “Ready” checklist (HelixIntel-branded)

- Tailwind config present with **HelixIntel tokens**, dark mode, plugins.
- Global CSS defines light/dark variables; body uses `bg-background` / `text-foreground`.
- Inter font wired; headings 900, body 400.
- shadcn components use semantic classes (`bg-primary`, `text-muted-foreground`, etc.).
- Prettier/Tailwind class sorting enabled; optional ESLint plugin active.
- Storybook tokens story + `/style-check` page validate visual system in both themes.

> At this point, Tailwind is fully branded for **HelixIntel** and ready for rapid, LLM‑assisted feature work without styling debt.
