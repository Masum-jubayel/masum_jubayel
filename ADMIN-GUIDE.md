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

## Names on comments

- Your name on comments and replies comes from your profile in the database (`profiles.display_name`, set by the SQL file) and shows an **Author** badge.
- Readers choose a display name once, the first time they comment; it is saved to their profile and used on all their comments (they can change it with “change”, and old comments update too).

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
