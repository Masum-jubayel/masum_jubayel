-- Run once in Supabase → SQL Editor → New query → paste everything → Run.
-- Safe to run more than once.

-- Guest comments: visitors comment with just a name (no sign-in).
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

-- Check: should list guest_key and guest_ip.
select column_name from information_schema.columns where table_schema = 'public' and table_name = 'comments' and column_name like 'guest%';
