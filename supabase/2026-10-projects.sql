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

-- 4) Guest comments: visitors comment with just a name (no sign-in).
--    Guest comments are written only by the website server (service-role key); the browser cannot insert them directly.
alter table public.comments alter column user_id drop not null;
alter table public.comments add column if not exists guest_key text;
alter table public.comments add column if not exists guest_ip text;
alter table public.comments drop constraint if exists comment_author_present;
alter table public.comments add constraint comment_author_present check (user_id is not null or guest_key is not null);
create index if not exists comments_guest_recent_idx on public.comments (guest_key, created_at desc);

create or replace function public.comments_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  recent_min int;
  recent_hour int;
  parent_row public.comments;
  moderated boolean;
  is_guest boolean := auth.uid() is null;
begin
  if is_guest then
    if coalesce(auth.role(), '') <> 'service_role' then raise exception 'Authentication required'; end if;
    if new.guest_key is null or char_length(new.guest_key) < 16 then raise exception 'Guest key required'; end if;
    new.user_id := null;
  else
    new.user_id := auth.uid();
    new.guest_key := null;
    new.guest_ip := null;
  end if;
  new.created_at := now();
  new.edited_at := null;
  new.deleted_at := null;

  if is_guest or not public.is_admin() then
    select coalesce((value)::text::boolean, false) into moderated from public.app_settings where key = 'comment_moderation';
    new.status := case when coalesce(moderated, false) then 'pending' else 'visible' end;

    select count(*) into recent_min from public.comments
      where created_at > now() - interval '1 minute'
        and (case when is_guest then (guest_key = new.guest_key or (new.guest_ip is not null and guest_ip = new.guest_ip)) else user_id = auth.uid() end);
    if recent_min >= 3 then raise exception 'RATE_LIMIT: Please wait a minute before commenting again.'; end if;
    select count(*) into recent_hour from public.comments
      where created_at > now() - interval '1 hour'
        and (case when is_guest then (guest_key = new.guest_key or (new.guest_ip is not null and guest_ip = new.guest_ip)) else user_id = auth.uid() end);
    if recent_hour >= 20 then raise exception 'RATE_LIMIT: Hourly comment limit reached.'; end if;

    if exists (select 1 from public.comments where body = new.body and created_at > now() - interval '1 day'
               and (case when is_guest then guest_key = new.guest_key else user_id = auth.uid() end)) then
      raise exception 'DUPLICATE: You already posted this comment.';
    end if;
  end if;

  if new.parent_id is not null then
    select * into parent_row from public.comments where id = new.parent_id;
    if parent_row.id is null or parent_row.post_slug <> new.post_slug then raise exception 'Invalid parent comment'; end if;
    if parent_row.parent_id is not null then new.parent_id := parent_row.parent_id; end if;
  end if;
  return new;
end $$;

-- 5) Check: should list guest_key and guest_ip.
select column_name from information_schema.columns where table_schema = 'public' and table_name = 'comments' and column_name like 'guest%';
