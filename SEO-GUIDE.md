# Getting this site to the top when someone searches “Masum Jubayel”

Google ranks a personal site first for a name when (1) it knows the site exists, (2) the site clearly says it is that person, and (3) the person's other profiles link to it. The code already does (2). You do (1) and (3).

## Already done in the code
- Page title: “Masum Mohammad Jubayel (Masum Jubayel) — Lead IT Support & Network Administrator | Portfolio”.
- Your full name in the home page heading, description, keywords and Open Graph preview.
- Structured data (Person + WebSite + ProfilePage) with your other names and links to LinkedIn, GitHub, Instagram and Facebook (`sameAs`), job, employer, schools, location and CCNA.
- `rel="me"` on your social links, a sitemap at `/sitemap.xml`, `robots.txt`, canonical URL `https://masum-jubayel.vercel.app`.
- Support for Google and Bing verification codes through Vercel environment variables.

## 1. Google Search Console (15 minutes, most important)
1. Go to https://search.google.com/search-console and sign in with your Google account.
2. **Add property** → choose **URL prefix** → `https://masum-jubayel.vercel.app` → Continue.
3. Choose **HTML tag**. Copy only the code inside `content="…"`.
4. Vercel → your project → **Settings → Environment Variables** → add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` = that code (Production) → Save → **Deployments → ⋯ → Redeploy**.
5. Back in Search Console click **Verify**.
6. **Sitemaps** → enter `sitemap.xml` → Submit.
7. **URL inspection** → paste `https://masum-jubayel.vercel.app` → **Request indexing**. Repeat for `/about` and `/projects`.

## 2. Bing (also powers DuckDuckGo, Yahoo, ChatGPT search)
https://www.bing.com/webmasters → **Import from Google Search Console** (one click after step 1) → submit the sitemap.

## 3. Link to the site from every profile (very important)
- **LinkedIn:** Edit intro → Contact info → Website → add the URL (type “Portfolio”); also add it to Featured.
- **GitHub:** profile → Edit profile → Website. Also add it to the `masum_jubayel` repo “About” box and to each project repo.
- **Instagram / Facebook:** put the URL in the bio / Intro → Website.
- Use the same name everywhere: **Masum Mohammad Jubayel** (with “Masum Jubayel” where there is a short-name field).

## 4. Optional but powerful: your own domain
A domain such as `masumjubayel.com` (about $12–20/year) ranks noticeably better than a `vercel.app` address and looks more professional. Buy it (Vercel → Domains, or Namecheap / Cloudflare), add it in Vercel → Settings → Domains, set `NEXT_PUBLIC_SITE_URL` to it, redeploy, and add the new address in Search Console too.

## What to expect
Google usually shows a new site for an exact-name search within a few days to two weeks after indexing; reaching the very top above LinkedIn and Facebook can take a few weeks and depends on the profile links in step 3. Keep posting projects and blog posts — fresh content helps.
