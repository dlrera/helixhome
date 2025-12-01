---
name: scaffold-query-hook
description: Creates TanStack Query hooks wrapping Server Actions with proper caching and invalidation
---

# Scaffold Query Hook

## Description
Generates a custom React hook that wraps a Server Action with TanStack Query (`useQuery` or `useMutation`). This enforces the "No `useEffect`" rule and ensures consistent data fetching and caching.

## Usage
Run this when a Client Component needs to fetch data or perform a mutation.

## Steps
1.  **Input:** Ask for the hook name (e.g., `useAssets`) and the Server Action it wraps.
2.  **Template:** Read `hook-template.ts` from this skill's directory.
3.  **Replacement:** Replace `{{HookName}}`, `{{ServerAction}}`, and `{{QueryKey}}`.
4.  **Creation:** Write the file to `hooks/features/`.
5.  **Pattern Check:**
    *   If it's a **Query** (read), ensure `staleTime` is set (default 5 mins).
    *   If it's a **Mutation** (write), ensure `onSuccess` invalidates the relevant `queryKey`.
