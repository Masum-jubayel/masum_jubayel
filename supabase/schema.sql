-- =====================================================================
-- Masum Portfolio — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`) on a fresh project.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Profiles (one per auth user). Admins are flagged manually:
--   update public.profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 2 and 60),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles: update own name" on public.profiles;
create policy "profiles: update own name" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Prevent users from promoting themselves.
-- SECURITY INVOKER on purpose: current_user is the API role ('anon'/'authenticated') for site visitors,
-- and 'postgres' / 'service_role' for the SQL editor and server — those may change is_admin.
create or replace function public.protect_profile_admin()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.is_admin is distinct from old.is_admin and current_user in ('anon', 'authenticated') and not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  return new;
end $$;
drop trigger if exists profiles_protect_admin on public.profiles;
create trigger profiles_protect_admin before update on public.profiles for each row execute function public.protect_profile_admin();

-- ---------------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------------
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null
);
alter table public.app_settings enable row level security;
insert into public.app_settings (key, value) values ('comment_moderation', 'false'::jsonb) on conflict do nothing;

drop policy if exists "settings: admin all" on public.app_settings;
create policy "settings: admin all" on public.app_settings for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Blog posts (in addition to Markdown files in src/content/blog)
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,120}$'),
  title text not null check (char_length(title) between 3 and 160),
  excerpt text check (char_length(excerpt) <= 300),
  content text not null,
  category text,
  tags text[] not null default '{}',
  cover_url text,
  published boolean not null default false,
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.posts enable row level security;
create index if not exists posts_published_idx on public.posts (published, published_at desc);

create or replace function public.touch_post()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.published and new.published_at is null then new.published_at := now(); end if;
  return new;
end $$;
drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before insert or update on public.posts for each row execute function public.touch_post();

drop policy if exists "posts: public read published" on public.posts;
create policy "posts: public read published" on public.posts for select using (published or public.is_admin());
drop policy if exists "posts: admin write" on public.posts;
create policy "posts: admin write" on public.posts for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Comments
-- status: visible | pending | hidden. Soft delete via deleted_at.
-- ---------------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null check (post_slug ~ '^[a-z0-9-]{1,120}$'),
  parent_id uuid references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 60),
  body text not null,
  status text not null default 'visible' check (status in ('visible', 'pending', 'hidden')),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  constraint comment_body_len check (deleted_at is not null or char_length(body) between 2 and 2000)
);
alter table public.comments enable row level security;
create index if not exists comments_post_idx on public.comments (post_slug, created_at);
create index if not exists comments_user_recent_idx on public.comments (user_id, created_at desc);

-- Insert guard: identity, threading, moderation default and rate limits.
create or replace function public.comments_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  recent_min int;
  recent_hour int;
  parent_row public.comments;
  moderated boolean;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  new.user_id := auth.uid();
  new.created_at := now();
  new.edited_at := null;
  new.deleted_at := null;

  if not public.is_admin() then
    select coalesce((value)::text::boolean, false) into moderated from public.app_settings where key = 'comment_moderation';
    new.status := case when coalesce(moderated, false) then 'pending' else 'visible' end;

    select count(*) into recent_min from public.comments where user_id = auth.uid() and created_at > now() - interval '1 minute';
    if recent_min >= 3 then raise exception 'RATE_LIMIT: Please wait a minute before commenting again.'; end if;
    select count(*) into recent_hour from public.comments where user_id = auth.uid() and created_at > now() - interval '1 hour';
    if recent_hour >= 20 then raise exception 'RATE_LIMIT: Hourly comment limit reached.'; end if;

    if exists (select 1 from public.comments where user_id = auth.uid() and body = new.body and created_at > now() - interval '1 day') then
      raise exception 'DUPLICATE: You already posted this comment.';
    end if;
  end if;

  if new.parent_id is not null then
    select * into parent_row from public.comments where id = new.parent_id;
    if parent_row.id is null or parent_row.post_slug <> new.post_slug then raise exception 'Invalid parent comment'; end if;
    -- keep threads one level deep: replies to replies attach to the root comment
    if parent_row.parent_id is not null then new.parent_id := parent_row.parent_id; end if;
  end if;
  return new;
end $$;
drop trigger if exists comments_insert_guard on public.comments;
create trigger comments_insert_guard before insert on public.comments for each row execute function public.comments_before_insert();

-- Update guard: owners can only change body / soft-delete; admins can moderate.
-- SECURITY INVOKER: privileged roles (postgres, service_role, or the report auto-hide trigger) bypass the checks.
create or replace function public.comments_before_update()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user not in ('anon', 'authenticated') or public.is_admin() then return new; end if;
  if old.user_id <> auth.uid() then raise exception 'Not allowed'; end if;
  if old.deleted_at is not null then raise exception 'Comment was deleted'; end if;
  if new.post_slug <> old.post_slug or new.parent_id is distinct from old.parent_id or new.user_id <> old.user_id
     or new.status <> old.status or new.created_at <> old.created_at or new.author_name <> old.author_name then
    raise exception 'Only the comment text can be changed';
  end if;
  if new.deleted_at is not null then
    new.body := '';
  elsif new.body <> old.body then
    new.edited_at := now();
  end if;
  return new;
end $$;
drop trigger if exists comments_update_guard on public.comments;
create trigger comments_update_guard before update on public.comments for each row execute function public.comments_before_update();

drop policy if exists "comments: public read visible" on public.comments;
create policy "comments: public read visible" on public.comments for select
  using (status = 'visible' or user_id = auth.uid() or public.is_admin());
drop policy if exists "comments: authenticated insert" on public.comments;
create policy "comments: authenticated insert" on public.comments for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists "comments: owner or admin update" on public.comments;
create policy "comments: owner or admin update" on public.comments for update to authenticated
  using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "comments: admin delete" on public.comments;
create policy "comments: admin delete" on public.comments for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- Comment reports (auto-hide after 3 distinct reports)
-- ---------------------------------------------------------------------
create table if not exists public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  reason text not null check (char_length(reason) between 3 and 500),
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (comment_id, reporter_id)
);
alter table public.comment_reports enable row level security;

drop policy if exists "reports: authenticated insert" on public.comment_reports;
create policy "reports: authenticated insert" on public.comment_reports for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists "reports: admin read/update" on public.comment_reports;
create policy "reports: admin read/update" on public.comment_reports for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.reports_after_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.comment_reports where comment_id = new.comment_id and not resolved) >= 3 then
    update public.comments set status = 'hidden' where id = new.comment_id and status = 'visible';
  end if;
  return new;
end $$;
drop trigger if exists reports_autohide on public.comment_reports;
create trigger reports_autohide after insert on public.comment_reports for each row execute function public.reports_after_insert();

-- ---------------------------------------------------------------------
-- Contact messages (written by the server with the service-role key)
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) <= 200),
  subject text not null check (char_length(subject) between 3 and 150),
  message text not null check (char_length(message) between 20 and 5000),
  ip_hash text,
  user_agent text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages add column if not exists replied_at timestamptz;
alter table public.contact_messages add column if not exists reply text;
alter table public.contact_messages enable row level security;
create index if not exists contact_ip_recent_idx on public.contact_messages (ip_hash, created_at desc);

drop policy if exists "contact: admin only" on public.contact_messages;
create policy "contact: admin only" on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());
-- No anon/authenticated insert policy: only the service role (server) can insert.

-- ---------------------------------------------------------------------
-- Gallery (managed from /admin → Gallery). Images live in the public
-- "gallery" storage bucket; only admins can upload or delete.
-- ---------------------------------------------------------------------
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  caption text check (char_length(caption) <= 300),
  category text not null default 'Professional' check (char_length(category) between 2 and 40),
  kind text not null default 'photo' check (kind in ('photo', 'illustration', 'video')),
  image_url text not null,
  storage_path text,
  featured boolean not null default false,
  published boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.gallery_items drop constraint if exists gallery_items_kind_check;
alter table public.gallery_items add constraint gallery_items_kind_check check (kind in ('photo', 'illustration', 'video'));
alter table public.gallery_items enable row level security;
create index if not exists gallery_items_order_idx on public.gallery_items (published, sort, created_at desc);

drop policy if exists "gallery: public read published" on public.gallery_items;
create policy "gallery: public read published" on public.gallery_items for select using (published or public.is_admin());
drop policy if exists "gallery: admin write" on public.gallery_items;
create policy "gallery: admin write" on public.gallery_items for all using (public.is_admin()) with check (public.is_admin());

do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('gallery', 'gallery', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    on conflict (id) do nothing;

    drop policy if exists "gallery bucket: public read" on storage.objects;
    create policy "gallery bucket: public read" on storage.objects for select using (bucket_id = 'gallery');
    drop policy if exists "gallery bucket: admin insert" on storage.objects;
    create policy "gallery bucket: admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'gallery' and public.is_admin());
    drop policy if exists "gallery bucket: admin update" on storage.objects;
    create policy "gallery bucket: admin update" on storage.objects for update to authenticated using (bucket_id = 'gallery' and public.is_admin());
    drop policy if exists "gallery bucket: admin delete" on storage.objects;
    create policy "gallery bucket: admin delete" on storage.objects for delete to authenticated using (bucket_id = 'gallery' and public.is_admin());
  end if;
end $$;

-- ---------------------------------------------------------------------
-- "files" bucket: videos, PDFs, Word/Excel/PowerPoint and any other attachment
-- (projects, blog posts, memories, gallery videos, media library). 50 MB each.
-- ---------------------------------------------------------------------
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('files', 'files', true, 52428800, null)
    on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = null;

    drop policy if exists "files bucket: public read" on storage.objects;
    create policy "files bucket: public read" on storage.objects for select using (bucket_id = 'files');
    drop policy if exists "files bucket: admin insert" on storage.objects;
    create policy "files bucket: admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'files' and public.is_admin());
    drop policy if exists "files bucket: admin update" on storage.objects;
    create policy "files bucket: admin update" on storage.objects for update to authenticated using (bucket_id = 'files' and public.is_admin());
    drop policy if exists "files bucket: admin delete" on storage.objects;
    create policy "files bucket: admin delete" on storage.objects for delete to authenticated using (bucket_id = 'files' and public.is_admin());
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Resume PDF (managed from /admin → Resume). The current file's public URL is
-- stored in app_settings under key 'resume'; that one row is publicly readable.
-- ---------------------------------------------------------------------
drop policy if exists "settings: public read resume" on public.app_settings;
create policy "settings: public read resume" on public.app_settings for select using (key = 'resume');

do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('resumes', 'resumes', true, 10485760, array['application/pdf'])
    on conflict (id) do nothing;

    drop policy if exists "resumes bucket: public read" on storage.objects;
    create policy "resumes bucket: public read" on storage.objects for select using (bucket_id = 'resumes');
    drop policy if exists "resumes bucket: admin write" on storage.objects;
    create policy "resumes bucket: admin write" on storage.objects for insert to authenticated with check (bucket_id = 'resumes' and public.is_admin());
    drop policy if exists "resumes bucket: admin delete" on storage.objects;
    create policy "resumes bucket: admin delete" on storage.objects for delete to authenticated using (bucket_id = 'resumes' and public.is_admin());
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Home-page highlight cards (degrees, certifications, impact numbers).
-- Managed from /admin → Highlights. Seeded with the current five cards.
-- ---------------------------------------------------------------------
create table if not exists public.highlights (
  id uuid primary key default gen_random_uuid(),
  value text not null check (char_length(value) between 1 and 16),
  label text not null check (char_length(label) between 2 and 80),
  source text not null default '' check (char_length(source) <= 80),
  tag text not null default 'Certified' check (char_length(tag) <= 20),
  icon text not null default 'award',
  hue text not null default '#3ee6ff' check (hue ~ '^#[0-9a-fA-F]{6}$'),
  sort integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.highlights enable row level security;
drop policy if exists "highlights: public read" on public.highlights;
create policy "highlights: public read" on public.highlights for select using (published or public.is_admin());
drop policy if exists "highlights: admin write" on public.highlights;
create policy "highlights: admin write" on public.highlights for all using (public.is_admin()) with check (public.is_admin());

insert into public.highlights (value, label, source, tag, icon, hue, sort)
select * from (values
  ('M.A.S.', 'Computer Security & Forensic Administration', 'Fairleigh Dickinson University · 2025', 'Master’s', 'graduation', '#a78bfa', 10),
  ('B.Sc.', 'Computer Science & Engineering', 'Metropolitan University · 2019', 'Bachelor’s', 'book', '#4f8cff', 20),
  ('CCNA', 'Cisco Routing and Switching', 'Certification', 'Certified', 'network', '#3ee6ff', 30),
  ('20+', 'Restaurant sites cabled & networked', 'Great River / NCR Voyix project', 'Field', 'cable', '#34d399', 40),
  ('20+', 'Network-focused field work orders', 'Omnivir · Field Nation', 'Field', 'workflow', '#fbbf24', 50)
) as v(value, label, source, tag, icon, hue, sort)
where not exists (select 1 from public.highlights);

-- ---------------------------------------------------------------------
-- Editable page content (managed from /admin → Content). One row per
-- section (site, about, experience, education, certifications, awards,
-- research, skills, projects). Missing rows fall back to the defaults in code.
-- ---------------------------------------------------------------------
create table if not exists public.site_content (
  key text primary key check (key in ('gallery','layout','sections','scene','resume','contact','site','about','experience','education','certifications','awards','research','skills','projects','works','pages')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
drop policy if exists "content: public read" on public.site_content;
create policy "content: public read" on public.site_content for select using (true);
drop policy if exists "content: admin write" on public.site_content;
-- Older databases: widen the allowed keys to include 'layout' (Site controls).
alter table public.site_content drop constraint if exists site_content_key_check;
alter table public.site_content add constraint site_content_key_check check (key in ('gallery','layout','sections','scene','resume','contact','site','about','experience','education','certifications','awards','research','skills','projects','works','pages'));
create policy "content: admin write" on public.site_content for all using (public.is_admin()) with check (public.is_admin());


-- ---------------------------------------------------------------------
-- Likes on posts and comments (anonymous; one per browser via a hashed
-- cookie id). No public policies: only the server (service role) reads
-- and writes this table through /api/likes.
-- ---------------------------------------------------------------------
create table if not exists public.likes (
  target_type text not null check (target_type in ('post', 'comment', 'memory')),
  target_id text not null check (char_length(target_id) between 1 and 120),
  visitor text not null check (char_length(visitor) = 32),
  created_at timestamptz not null default now(),
  primary key (target_type, target_id, visitor)
);
alter table public.likes enable row level security;
create index if not exists likes_target_idx on public.likes (target_type, target_id);

create or replace function public.like_counts(p_type text, p_ids text[])
returns table (target_id text, n bigint)
language sql stable security invoker set search_path = public as $$
  select l.target_id, count(*)::bigint from public.likes l
  where l.target_type = p_type and l.target_id = any(p_ids)
  group by l.target_id
$$;
revoke all on function public.like_counts(text, text[]) from public, anon, authenticated;
grant execute on function public.like_counts(text, text[]) to service_role;

-- Blog post extras: animated cover style and featured flag.
alter table public.posts add column if not exists cover_style text not null default 'network';
alter table public.posts drop constraint if exists posts_cover_style_check;
alter table public.posts add constraint posts_cover_style_check
  check (cover_style in ('network', 'circuit', 'matrix', 'radar', 'waves', 'orbit', 'terminal', 'shield', 'pulse', 'grid', 'binary', 'cloud', 'chip', 'globe', 'signal', 'lock'));
alter table public.posts add column if not exists featured boolean not null default false;
-- Attachments shown under the article: [{ "title": "...", "url": "...", "note": "..." }]
alter table public.posts add column if not exists attachments jsonb not null default '[]'::jsonb;


-- ---------------------------------------------------------------------
-- Memories: social-style posts (status + photos) on the Gallery page.
-- Managed from /admin → Memories. Comments use post_slug = 'm-<id>'.
-- ---------------------------------------------------------------------
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  body text not null check (char_length(body) between 1 and 5000),
  images text[] not null default '{}' check (cardinality(images) <= 30),
  location text not null default '' check (char_length(location) <= 120),
  feeling text not null default '' check (char_length(feeling) <= 40),
  memory_date timestamptz not null default now(),
  pinned boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Up to 30 photos/videos per memory.
do $$ declare c text; begin
  for c in select conname from pg_constraint where conrelid = 'public.memories'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%cardinality(images)%' loop
    execute format('alter table public.memories drop constraint %I', c);
  end loop;
end $$;
alter table public.memories add constraint memories_images_max check (cardinality(images) <= 30);
-- Photo layout per post (adjustable in /admin → Memories).
alter table public.memories add column if not exists photo_fit text not null default 'fill' check (photo_fit in ('fill','fit'));
alter table public.memories add column if not exists photo_focus text not null default 'center' check (photo_focus in ('top','center','bottom'));
alter table public.memories add column if not exists photo_size text not null default 'normal' check (photo_size in ('compact','normal','large'));
alter table public.memories enable row level security;
drop policy if exists "memories: public read" on public.memories;
create policy "memories: public read" on public.memories for select using (published or public.is_admin());
drop policy if exists "memories: admin write" on public.memories;
create policy "memories: admin write" on public.memories for all using (public.is_admin()) with check (public.is_admin());
create index if not exists memories_feed_idx on public.memories (published, pinned desc, memory_date desc);

insert into public.memories (body, images, location, feeling, memory_date, pinned)
select * from (values
  ('Graduation day! 🎓 Proud to have completed my Master of Administrative Science in Computer Security and Forensic Administration at Fairleigh Dickinson University. Thank you to my family, professors and friends who supported me throughout this journey.',
   array['/images/gallery/commencement.jpg', '/images/gallery/graduation-portrait.jpg'], 'Fairleigh Dickinson University, Vancouver', 'proud', '2025-05-20T18:00:00Z'::timestamptz, true),
  ('Throwback to presenting our research “Risk Prediction of Stroke at The Early Stage Using Data Mining Techniques” at the 2nd International Conference on Innovation in Engineering and Technology (ICIET-2019), University of Dhaka.',
   array['/images/works/iciet-2019-certificate.jpg'], 'University of Dhaka, Bangladesh', 'grateful', '2019-12-24T10:00:00Z'::timestamptz, false),
  ('Champion of the Software Hackathon at LICT SUST Techfest 2019 with team MU-EDU GEN. Two days of building, debugging and very little sleep — worth every minute.',
   array['/images/certificates/sust-techfest-2019-hackathon-champion.jpg'], 'Shahjalal University of Science & Technology, Sylhet', 'excited', '2019-04-20T15:00:00Z'::timestamptz, false)
) as v(body, images, location, feeling, memory_date, pinned)
where not exists (select 1 from public.memories);
