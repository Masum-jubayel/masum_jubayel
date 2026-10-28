# Going live — GitHub → Supabase → Vercel (all free)

Total time: about 30–45 minutes, once. After that the site runs by itself.

---

## 1. Put the code on GitHub

1. Create a free account at **github.com**.
2. Install **GitHub Desktop** (desktop.github.com) and sign in with that account.
3. Unzip `masum-portfolio.zip`. You get a folder called `portfolio`.
4. GitHub Desktop → **File → Add local repository** → choose the `portfolio` folder →
   it says “not a Git repository” → click **create a repository** → **Create repository**.
5. Click **Publish repository**. Name: `masum-portfolio`. Leave **“Keep this code private”** ticked → **Publish**.

> The `.gitignore` already keeps secrets (`.env.local`) and build folders out of GitHub.
> Never put real keys in any file you upload.

---

## 2. Create the database (Supabase)

1. Sign up at **supabase.com** → **New project**.
   - Name: `masum-portfolio` · Region: closest to Canada (e.g. *Canada (Central)* or *East US*)
   - Database password: make a strong one and save it somewhere safe.
2. Wait ~2 minutes for it to finish.
3. Left menu → **SQL Editor** → **New query** → open `supabase/schema.sql` from the folder,
   copy **everything**, paste, click **Run**. You should see “Success”.
4. Left menu → **Project Settings → API** (or **Data API / API Keys**). Copy and keep these three:
   - **Project URL** → `https://xxxx.supabase.co`
   - **anon / public** key
   - **service_role / secret** key (keep this one private!)

---

## 3. Contact-form email (Resend)

1. Sign up at **resend.com** with **masumjubayel@gmail.com**.
2. **API Keys → Create API key** → copy it.
3. Until you own a domain, keep the sender as `Portfolio <onboarding@resend.dev>` —
   contact-form messages will reach your Gmail. (Replying to visitors from the admin needs a
   verified domain; until then use the **“Open in email app”** button in Admin → Messages.)

---

## 4. Put the site online (Vercel)

1. Sign up at **vercel.com** → **Continue with GitHub** → plan **Hobby** (free).
2. **Add New… → Project** → pick `masum-portfolio` → **Import**.
3. Framework is detected as **Next.js** — leave the build settings alone.
4. Open **Environment Variables** and add each of these (Name → Value):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://masum-portfolio.vercel.app` (change later if you buy a domain) |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from step 2 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `RESEND_API_KEY` | key from step 3 |
| `CONTACT_TO_EMAIL` | `masumjubayel@gmail.com` |
| `CONTACT_FROM_EMAIL` | `Portfolio <onboarding@resend.dev>` |
| `IP_HASH_SALT` | any long random text (e.g. 40 random letters/numbers) |
| `CRON_SECRET` | another long random text |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `masumjubayel@gmail.com` |

   Optional: `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_GITHUB_URL`, `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`.

5. Click **Deploy**. In 2–4 minutes you get your address, e.g. `https://masum-portfolio.vercel.app`.
   If the name differs, update `NEXT_PUBLIC_SITE_URL` (Settings → Environment Variables) and
   **Deployments → ⋯ → Redeploy**.

---

## 5. Connect sign-in to your new address (Supabase)

Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://masum-portfolio.vercel.app`
- **Redirect URLs** → Add: `https://masum-portfolio.vercel.app/auth/callback`
  (and `http://localhost:3000/auth/callback` if you ever run it on your computer)
- Save.

---

## 6. Make yourself the admin

1. Open your site → press **Ctrl + Shift + A** (or tap the © line in the footer 5 times) → **Sign in**.
2. Enter **masumjubayel@gmail.com** → open the email → click the link.
3. Supabase → **SQL Editor** → run:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'masumjubayel@gmail.com');
```

4. Back on the site → Ctrl + Shift + A again → you’re in the admin panel. Done.

---

## 7. Check that everything works

- [ ] Home, Gallery, Projects, Resume pages load
- [ ] Contact form → message arrives in Gmail and in Admin → Messages
- [ ] Admin → upload a photo in Gallery → it appears on the Gallery page
- [ ] Open `https://YOUR-SITE/api/keepalive?key=YOUR_CRON_SECRET` → shows `{"ok":true}`
- [ ] Vercel → Project → **Settings → Cron Jobs** shows `/api/keepalive` once a day

---

## Later (optional)

- **Your own domain** (~$10–15/year): Vercel → Settings → **Domains** → add it and follow the DNS steps.
  Then update `NEXT_PUBLIC_SITE_URL`, the Supabase Site/Redirect URLs, and verify the domain in
  Resend so admin replies come from e.g. `hello@yourdomain.com`.
- **Editing the code later**: change files in the `portfolio` folder → GitHub Desktop → *Commit* → *Push*.
  Vercel redeploys automatically. (Content changes in the admin panel never need this.)
- **Backup**: Admin → Settings → Backup downloads all your content as a file.
