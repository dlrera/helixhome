---
name: animate-interaction
description: Adds micro-animations and transitions to UI elements including hover states, entry animations, and focus indicators
---

# Animate Interaction

## Description
Enhances UI components with "Premium" micro-animations and transitions to meet the HelixIntel design aesthetic. It focuses on hover states, entry/exit animations, and active states using Tailwind CSS and Framer Motion (if available).

## Usage
Run this skill when creating or polishing interactive elements like Cards, Buttons, Modals, or List Items.

## Steps
1.  **Hover States:**
    *   Scan for interactive elements (`button`, `a`, `div` with `onClick`).
    *   **Rule:** Add `transition-all duration-200 ease-in-out` to enable smooth state changes.
    *   **Effect:** Add `hover:scale-[1.02]` or `hover:-translate-y-0.5` for "lift" effects on cards.
    *   **Shadow:** Add `hover:shadow-md` (using brand colors if applicable) to create depth.

2.  **Active/Focus States:**
    *   **Rule:** Ensure `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` is present for accessibility and visual feedback.
    *   **Click:** Add `active:scale-95` for buttons to provide tactile "press" feedback.

3.  **Entry Animations:**
    *   For lists or grids, suggest adding a staggered entry animation.
    *   **Class:** `animate-in fade-in slide-in-from-bottom-4 duration-500` (using Tailwind CSS Animate plugin).

4.  **Glassmorphism:**
    *   If the element is an overlay or sticky header, apply: `bg-background/80 backdrop-blur-md border-b`.
