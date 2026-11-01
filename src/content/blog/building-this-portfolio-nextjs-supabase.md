---
title: "How I Built This Portfolio: Next.js, Supabase and Free Hosting"
excerpt: "A tour of the stack behind this site — an editable CMS, a photo editor, three themes and a hosting setup that stays awake for free."
date: "2026-10-29"
category: "Web Development"
tags: ["Next.js", "React", "TypeScript", "Supabase", "Vercel", "Tailwind CSS"]
cover: "/images/projects/portfolio-jarvis.jpg"
coverStyle: "orbit"
---

I wanted a portfolio I could update myself in seconds, that loads fast, costs nothing and never goes to sleep. Here is how it is put together.

## The stack

- **Next.js 15** (App Router) and **React 19** with **TypeScript**.
- **Tailwind CSS** for styling, with colours driven by CSS variables.
- **Motion** for animation, with reduced-motion respected everywhere.
- **Supabase** for the database, sign-in and file storage.
- **Vercel** for hosting, **Resend** for contact-form email.

## An admin console, not a code edit

Every section — profile, resume, projects, blog, gallery, memories, layout and theme — has an editor in the admin console. Content is saved to Supabase and protected by **row-level security**: anyone can read published content, but only accounts flagged as admin can write.

## Editing photos without changing them

The media editor lets me set the focal point, zoom, rotate, flip, adjust colour, apply presets and trim videos. The adjustments are saved *with the link* to the file, so the original is never modified and every page shows the same look.

## Three themes

Dark, Light and **Jarvis** (cyan and gold, with a subtle HUD grid). Each theme is a set of CSS variables; Tailwind colours read from them, so one click re-paints the whole site and the choice is remembered.

## Free, and awake

Free databases pause when idle. A daily scheduled job on Vercel calls a small keep-alive endpoint, protected by a secret, which runs a tiny query. No manual visits needed.

## Security basics

- Secrets live in environment variables, never in Git.
- The service key never reaches the browser.
- Admin access is enforced by the database, not just hidden buttons.

See the project page: [This Portfolio](/projects/masum-jubayel-portfolio).
