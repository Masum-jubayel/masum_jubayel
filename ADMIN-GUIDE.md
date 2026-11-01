# Admin guide — masum-jubayel.vercel.app

## One-time setup (only once)

1. Open **https://masum-jubayel.vercel.app/login**, enter `masumjubayel@gmail.com` and click the link in the email. This creates your account.
2. In Supabase open **SQL Editor → New query**, paste the whole file `supabase/2026-10-projects.sql` and click **Run**.
   - The `select` near the top should show your email with `is_admin = true`.
3. Sign out and sign in again (or refresh). `/admin` now opens.

## Getting into the admin panel (every time)

There is no public "Admin" button. Use any of these:

- Keyboard: **Ctrl + Shift + A** (Mac: **⌘ + Shift + A**) on any page.
- Phone: tap the **© line in the footer 5 times** quickly.
- Or type the address: **https://masum-jubayel.vercel.app/admin**

If you are not signed in you are sent to the sign-in page: enter your email, click the magic link, and you land back in the admin.

## Comments and names

- **Visitors don't need an account.** They type a name once (remembered in their browser), then comment, reply and like. They can edit or delete their own comments and change their name (their older comments update too).
- Names containing “Masum”, “Jubayel”, “admin”, “moderator” or “author” are blocked for visitors, so nobody can pose as you.
- **You** comment while signed in: your name comes from your profile in the database and shows an **Author ✓** badge.
- Spam protection: hidden honeypot field, link/word filter, 3 comments per minute and 20 per hour per visitor, duplicate check. Turn on “require approval” in Admin → Settings to approve every comment first.

## What you can edit

| Tab | What it changes |
| --- | --- |
| Content | Every section: profile, home, about, CTA (incl. the AI control panel), skills, projects, layout, theme |
| Posts | Blog posts (Markdown), cover images, attachments |
| Gallery | Photos and videos, with the media editor (focus, zoom, colour, trim) |
| Memories | Social-style posts on the Gallery page |
| Comments | Moderate, approve, hide, answer reports |
| Messages | Contact-form messages |

Project live links: **Content → Projects → (project) → Demo URL**.

## Troubleshooting

- **"Not authorized" / "not an administrator"** — step 2 above was not run, or you signed in with a different email. Run the `select` line in the SQL file to check.
- **Magic link opens the wrong site** — Supabase → Authentication → URL Configuration: Site URL `https://masum-jubayel.vercel.app`, Redirect URL `https://masum-jubayel.vercel.app/auth/callback`.
- **"Invalid path specified in request URL"** — Vercel env `NEXT_PUBLIC_SUPABASE_URL` must be exactly `https://htbiridjrpbmlceiuxja.supabase.co` (no `/rest/v1`).
