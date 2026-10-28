---
title: "Responsive Layouts with CSS Grid and clamp()"
excerpt: "Three modern CSS patterns that replace most media queries: auto-fitting grids, fluid type with clamp(), and container-friendly cards."
date: "2026-10-03"
category: "Web Development"
tags: ["CSS", "Responsive design", "Grid", "Web"]
coverStyle: "orbit"
---

A lot of the "responsive" CSS I used to write was media-query bookkeeping. Modern CSS lets the layout adapt by itself.

## 1. Grids that fit themselves

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.25rem;
}
```

Each card is at least 16rem wide; the browser fits as many columns as the screen allows — one on a phone, four on a wide monitor — with **no media queries**.

## 2. Fluid type with clamp()

```css
h1 { font-size: clamp(2.2rem, 1.2rem + 4vw, 4.25rem); }
p  { font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem); }
```

`clamp(min, preferred, max)` scales smoothly between a minimum and maximum. Headlines grow with the screen but never become absurd.

## 3. Stop grid children from overflowing

Long words, URLs and code blocks can push a grid column wider than the screen. One line fixes it:

```css
.layout > * { min-width: 0; }
```

Grid and flex items default to `min-width: auto`, which means "never shrink below my content." Setting it to `0` lets them shrink and wrap.

## 4. Respect reduced motion

Animations make a site feel alive, but some people get motion sickness. Always provide an escape hatch:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

## Checklist before you ship

- Test at **360px** wide — the most common small phone width.
- Check there is **no horizontal scroll** on any page.
- Tab through the page with the keyboard and make sure focus is visible.
- Run Lighthouse for performance and accessibility.
