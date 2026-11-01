-- Portfolio update, Oct 2026. Run in Supabase → SQL Editor → New query → Run. Safe to run more than once.

-- 1) Make your account an administrator (fixes "Not authorized" on /admin).
--    Sign in on the site once first, so your profile row exists.
update public.profiles set is_admin = true
where id = (select id from auth.users where lower(email) = lower('masumjubayel@gmail.com'));

-- 1b) Your comment name comes from the database: set it once (change the text if you like).
update public.profiles set display_name = 'Masum Mohammad Jubayel'
where id = (select id from auth.users where lower(email) = lower('masumjubayel@gmail.com'));

-- 2) Check it worked: this should return one row with is_admin = true.
select u.email, p.display_name, p.is_admin from auth.users u join public.profiles p on p.id = u.id where lower(u.email) = lower('masumjubayel@gmail.com');

-- 3) Project posts for the Gallery → Memories feed.
delete from public.memories where body like 'Shipped the POC & SIM Operations Center%';
insert into public.memories (body, images, location, feeling, memory_date, pinned)
select v.* from (values
  ('Meet Jarvis 🤖 — my personal AI agent. It plans a task, uses tools (browser, files, spreadsheets, scripts), checks its own work and asks before anything irreversible. It also inspired the new Jarvis theme on this site — try the switch at the top!',
   array['/images/projects/jarvis-ai-agent.jpg'], 'Grande Prairie, Alberta', 'excited', '2026-10-30T18:00:00.000Z'::timestamptz, false),
  ('My portfolio is live! Built with Next.js, Supabase and Tailwind, hosted free on Vercel — with an admin console, photo editor and three themes (Dark, Light, Jarvis).',
   array['/images/projects/portfolio-dark.jpg', '/images/projects/portfolio-jarvis.jpg'], 'Grande Prairie, Alberta', 'proud', '2026-10-29T18:00:00.000Z'::timestamptz, false),
  ('Shipped the POC Ops Center 📡 — one command dashboard for 217 companies, 2,667 push-to-talk radios and 2,951 carrier SIMs across Inrico, Telus Jasper, Simplex, Hologram and Mobilewave. It matches every radio to its SIM, explains every mismatch, tracks licences before they expire and showed us 206 idle SIMs (~$2,050/month) to clean up.',
   array['/images/projects/poc-ops-center-overview.jpg'], 'Expert Mobile Communications', 'accomplished', '2026-10-28T18:00:00.000Z'::timestamptz, false),
  ('New Install Board is running: live Day/Week/Month views for our installers, slot locks so no more double bookings, rentals tracking and reports.',
   array['/images/projects/install-board.jpg'], 'Expert Mobile Communications', 'motivated', '2026-10-26T18:00:00.000Z'::timestamptz, false),
  ('Delivered the BC680 body-cam backup system: three hash-verified copies of every recording across two offices, checked every 2 minutes, with a full rebuild guide and staff training.',
   array['/images/projects/bc680-overview.jpg', '/images/projects/bc680-guide.jpg'], 'Expert Mobile Communications', 'accomplished', '2026-10-24T18:00:00.000Z'::timestamptz, false),
  ('Refreshed the Expert Mobile website — “Everything wireless. Under one roof.” Single-file build, built-in admin panel and a live push-to-talk console demo.',
   array['/images/projects/expert-mobile-home.jpg', '/images/projects/expert-mobile-section.jpg'], 'Grande Prairie, Alberta', 'happy', '2026-10-20T18:00:00.000Z'::timestamptz, false)
) as v(body, images, location, feeling, memory_date, pinned)
where not exists (select 1 from public.memories m where m.body = v.body);
