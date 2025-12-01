---
name: optimize-db-query
description: Audits Prisma queries for N+1 problems, missing indexes, and over-fetching to meet the 300ms performance target
---

# Optimize DB Query

## Description
Audits and optimizes Prisma database queries to meet the <300ms performance target. It identifies common "N+1" problems, missing indexes, and over-fetching.

## Usage
Run this when a query is flagged as slow or during a performance audit.

## Steps
1.  **Analyze:** Read the Prisma query code.
2.  **Check 1: Over-fetching**
    *   **Bad:** `include: { history: true }` (fetches all columns of related table).
    *   **Fix:** Use `select: { id: true, status: true }` to fetch only needed fields.
3.  **Check 2: Missing Index**
    *   **Bad:** Filtering by a field not in `@@index` in `schema.prisma`.
    *   **Fix:** Suggest adding `@@index([fieldName])` to the model.
4.  **Check 3: Unbounded Queries**
    *   **Bad:** `findMany()` without `take`.
    *   **Fix:** Add `take: 20` (pagination) or a strict `where` clause.
5.  **Check 4: N+1 Problem**
    *   **Bad:** looping over results and calling `db.findUnique` inside the loop.
    *   **Fix:** Use `findMany` with `where: { id: { in: ids } }`.
