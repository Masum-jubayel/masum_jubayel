# Masum Mohammad Jubayel — Portfolio

A 3D networking & cybersecurity portfolio built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS · React Three Fiber/Drei · Motion · Supabase**.

> Lead IT Support & Network Administrator — *Engineering Networks. Securing the Digital World.*

---

## Features

| Area | What's included |
|---|---|
| **Home** | Interactive 3D network-engineer workstation (5 live canvas monitors: topology, IOS console, traffic, firewall events, rack health; server racks with blinking LEDs; animated packets on network paths; mouse parallax). Static SVG fallback for no-WebGL / data-saver / low-memory devices, lighter tier on mobile, still frame for `prefers-reduced-motion`, render loop paused when off-screen. |
| **About** | Profile photo slot, intro, current role, education, achievements, cybersecurity interests, career timeline, research & awards, objectives. |
| **Skills** | Filterable dashboard. Every skill is labeled by **evidence** (Professional Experience / Certified / Working Knowledge / Academic Background / Currently Developing) — no fake percentages. |
| **Experience** | Animated, expandable timeline. Titles and dates exactly as on the resume (overlaps kept). |
| **Projects** | Searchable/filterable library with 3D tilt cards, generated cover art, animated SVG topology diagrams, code snippets, case-study pages. Drafts are clearly labeled. |
| **Blog** | Markdown files **and** database posts, search, category/tag filters, TOC with scroll-spy, syntax highlighting, reading time, share buttons, related posts, RSS (`/blog/rss.xml`), real comment system. |
| **Comments** | Supabase-backed: replies, edit, soft-delete, report, moderation queue, auto-hide after 3 reports, DB-enforced rate limits & duplicate detection, server-side validation (zod), plain-text rendering. Posting requires a **verified email** (magic link); reading is public. |
| **Admin** (`/admin`) | Write/publish/delete posts (Markdown editor + sanitized preview), moderate comments, handle reports, read contact messages, toggle "require approval". |
| **Resume** | HTML resume (print-friendly) + the original PDF for download and an on-demand viewer. No address/phone shown on the site. |
| **Gallery** | Masonry grid, category filters, keyboard-accessible lightbox, lazy loading, every image labeled *Real photo / Illustration / Placeholder*. |
| **Achievements** | Certification, research and trophy cards. |
| **Contact** | Validated form → stored in Supabase and/or emailed via Resend; honeypot, timing check, spam heuristics, per-IP rate limit. |
| **SEO / a11y** | Metadata, Open Graph image, JSON-LD, sitemap, robots, skip link, focus styles, keyboard navigation, ARIA live regions, reduced motion. |

---

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in what you have — everything degrades gracefully
npm run dev                  # http://localhost:3000
```

Without any environment variables the whole site works; comments show "not connected yet" and the contact form tells visitors to use the email link.

Scripts: `npm run dev` · `npm run build` · `npm start` · `npm run lint` · `npm run typecheck`

---

## Backend setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste **`supabase/schema.sql`** → Run. This creates tables, RLS policies, triggers (rate limits, moderation, auto-hide) and the profile trigger.
3. **Authentication → URL Configuration**
   - Site URL: your production URL (e.g. `https://yourdomain.com`)
   - Redirect URLs: add `http://localhost:3000/auth/callback` and `https://yourdomain.com/auth/callback`
4. **Authentication → Providers → Email**: keep Email enabled (magic link). Configure custom SMTP for production volume.
5. Copy the URL, `anon` key and `service_role` key into `.env.local` (and into your host's env settings).
6. **Make yourself admin**: sign in once at `/login`, then run in the SQL editor:
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'masumjubayel@gmail.com');
   ```
7. Visit `/admin`.

### Security model

- All tables have **Row Level Security**. Visitors can only read *visible* comments and *published* posts.
- Comment identity (`user_id`), status and threading are **forced by a trigger** — clients can't spoof them.
- Owners may only edit the comment text or soft-delete; admins moderate. Users can't promote themselves.
- Rate limits: 3 comments/minute, 20/hour per user, duplicate bodies rejected (database), plus an in-memory burst limiter at the API.
- `contact_messages` has no public insert policy — only the server (service-role key) writes to it. IPs are stored as salted hashes.
- Markdown is sanitized with `rehype-sanitize`; comments are rendered as plain text.
- Admin routes are protected by middleware **and** checked again in every server action and by RLS.

The schema has been tested against PostgreSQL 16 with a mocked Supabase `auth` schema (RLS, rate limit, threading, moderation, report auto-hide and privilege checks).

## Contact email (Resend)

1. Create an account at [resend.com](https://resend.com), verify your domain, create an API key.
2. Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`.
3. Messages are emailed with `reply-to` set to the visitor and, if Supabase is configured, also saved to `/admin?tab=messages`.

---

## Editing content

**Everything below can now be edited in the browser at `/admin → Content`** (profile & contact, hero text, employer logo, About page, experience with structured responsibility sections, education, certifications, awards, research with paper PDF + certificate, skills, projects, **Selected work** on Achievements with image/PDF uploads, and **Page headings** for every page section), plus `/admin` tabs for home highlight cards (38 icons incl. a cybersecurity set, 18 colours, edit, up/down reorder), blog posts, gallery photos and the resume PDF. Every list section has Up / Down / Duplicate / Delete. PDFs uploaded from the Content editor go to the `resumes` storage bucket under `docs/`. After pulling this version, re-run `supabase/schema.sql` once so the `site_content` table accepts the new `works` and `pages` keys. The files listed here are the defaults used until you save a change in the admin panel; *Restore default* removes your override.


| What | Where |
|---|---|
| Name, title, links, resume path, profile/cover photo, hero 3D model | `src/lib/site.ts` |
| Experience, education, certifications, research, awards | `src/content/profile.ts` |
| Skills & evidence labels | `src/content/skills.ts` |
| Projects & drafts | `src/content/projects.ts` |
| Gallery | `src/content/gallery.ts` (+ images in `public/images/gallery/`) |
| Blog (file posts) | `src/content/blog/*.md` (frontmatter: title, excerpt, date, category, tags, cover, draft) |
| Blog (database posts) | `/admin` |
| 3D scene colors, clothing, monitor layout | `src/components/hero/sceneConfig.ts` |

**Replace the resume:** overwrite `public/resume/Masum_Mohammad_Jubayel_Resume.pdf` (same filename) — or set `NEXT_PUBLIC_RESUME_URL` to a hosted PDF. Then refresh the page previews shown on the Resume page:

```bash
pdftoppm -r 110 -jpeg public/resume/Masum_Mohammad_Jubayel_Resume.pdf public/resume/pages/page
```

(If the page count changes, update `PAGES` in `src/components/sections/ResumeViewer.tsx`.)

**Photos:** put `profile.jpg` / `cover.jpg` in `public/images/` and set `profilePhoto` / `hero.coverImage` in `site.ts`. Until then, labeled placeholders are shown.

**Custom 3D character:** drop a `.glb` into `public/models/` and set `site.hero.characterModelUrl = "/models/engineer.glb"`. If it fails to load, the built-in stylized engineer is used.

---

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel (framework: Next.js).
2. Add the environment variables from `.env.example` (set `NEXT_PUBLIC_SITE_URL` to your domain).
3. Deploy, then add the production `/auth/callback` URL in Supabase.

Any Node 18.18+ host works (`npm run build && npm start`).

### Staying awake on the free plans (no maintenance)

Supabase pauses free projects after about a week with no activity. `vercel.json` schedules a
**daily cron job** that calls `/api/keepalive`, which makes one tiny database read, so the project
always stays active. It runs automatically on Vercel's free Hobby plan — nothing to do by hand.

- Optional: set `CRON_SECRET` in Vercel so only Vercel can call the endpoint.
- Optional backup: add a free uptime monitor (e.g. UptimeRobot) for
  `https://YOUR-SITE/api/keepalive?key=YOUR_CRON_SECRET` — it also emails you if the site ever goes down.
- Check it any time: open `/api/keepalive` (with `?key=` if you set a secret) — it returns `{"ok":true}`.

---

## Placeholders still to provide

- Profile photograph and cover image
- LinkedIn, GitHub, Instagram and Facebook URLs (`NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_GITHUB_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_FACEBOOK_URL`, or in `src/lib/site.ts`)
- Research abstract and paper link (`src/content/profile.ts`)
- Project screenshots, repos, stack details for the inventory system, measured results
- Real gallery photos
- Starter blog articles in `src/content/blog/` are general tutorials — review/edit them before launch

## Project structure

```
src/
  app/                 routes (pages, API routes, admin, auth, sitemap, robots, OG image)
  components/
    hero/              3D scene, screens, fallback, config
    layout/            navbar, footer
    sections/          timeline, skills dashboard, achievements, resume viewer
    projects/ blog/ gallery/ contact/ admin/ ui/
  content/             typed resume-derived data + markdown posts
  lib/                 site config, env, Supabase clients, blog engine, validation, rate limiting
supabase/schema.sql    database schema, RLS and triggers
public/resume/         downloadable resume PDF
```


## Blog likes, covers and the post dashboard

- **Likes** on posts and comments go through `/api/likes` (anonymous, one per browser via a hashed cookie id). They need `SUPABASE_SERVICE_ROLE_KEY` and the `likes` table + `like_counts()` function from `supabase/schema.sql`.
- **Covers:** each post uses an uploaded cover photo, or one of 8 animated styles (network, circuit, matrix, radar, waves, orbit, terminal, shield). File posts set `coverStyle:` and `featured: true` in front matter.
- **Admin → Posts** shows stats, search, filters and one-click publish / feature / duplicate / delete. “Edit in admin” copies a Markdown-file post into the database so it can be edited in the browser.
- Re-run `supabase/schema.sql` after updating (adds `likes`, `cover_style`, `featured`, and the `works` / `pages` content keys).
