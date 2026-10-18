create table if not exists public.cyberatelier_action_totals (
  profile text not null check (profile in ('senior', 'young', 'work')),
  action text not null check (action in ('click', 'delete', 'verify')),
  total bigint not null default 0 check (total >= 0),
  primary key (profile, action)
);

alter table public.cyberatelier_action_totals enable row level security;

revoke all on table public.cyberatelier_action_totals from public, anon, authenticated;

create or replace function public.record_cyberatelier_action(
  p_profile text,
  p_action text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_profile is null or p_profile not in ('senior', 'young', 'work')
     or p_action is null or p_action not in ('click', 'delete', 'verify') then
    raise exception 'Profil ou action invalide' using errcode = '22023';
  end if;

  insert into public.cyberatelier_action_totals as current_totals (profile, action, total)
  values (p_profile, p_action, 1)
  on conflict (profile, action)
  do update set total = current_totals.total + 1;
end;
$$;

create or replace function public.get_cyberatelier_action_totals()
returns table (
  profile text,
  action text,
  total bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profiles.profile,
    actions.action,
    coalesce(totals.total, 0)::bigint
  from (values ('senior'::text), ('young'::text), ('work'::text)) as profiles(profile)
  cross join (values ('click'::text), ('delete'::text), ('verify'::text)) as actions(action)
  left join public.cyberatelier_action_totals as totals
    on totals.profile = profiles.profile
   and totals.action = actions.action
  order by profiles.profile, actions.action;
$$;

revoke all on function public.record_cyberatelier_action(text, text) from public, anon, authenticated;
revoke all on function public.get_cyberatelier_action_totals() from public, anon, authenticated;

grant execute on function public.record_cyberatelier_action(text, text) to anon, authenticated;
grant execute on function public.get_cyberatelier_action_totals() to anon, authenticated;

create table if not exists public.cyberatelier_page_visits (
  singleton boolean primary key default true check (singleton),
  total bigint not null default 0 check (total >= 0)
);

insert into public.cyberatelier_page_visits (singleton, total)
values (true, 0)
on conflict (singleton) do nothing;

create table if not exists public.cyberatelier_active_sessions (
  session_id uuid primary key,
  last_seen timestamptz not null default now()
);

alter table public.cyberatelier_page_visits enable row level security;
alter table public.cyberatelier_active_sessions enable row level security;

revoke all on table public.cyberatelier_page_visits from public, anon, authenticated;
revoke all on table public.cyberatelier_active_sessions from public, anon, authenticated;

create or replace function public.record_cyberatelier_page_visit(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_session_id is null then
    raise exception 'Session invalide' using errcode = '22023';
  end if;

  insert into public.cyberatelier_page_visits as current_visits (singleton, total)
  values (true, 1)
  on conflict (singleton)
  do update set total = current_visits.total + 1;

  delete from public.cyberatelier_active_sessions
  where last_seen < now() - interval '2 minutes';

  insert into public.cyberatelier_active_sessions as current_sessions (session_id, last_seen)
  values (p_session_id, now())
  on conflict (session_id)
  do update set last_seen = excluded.last_seen;
end;
$$;

create or replace function public.heartbeat_cyberatelier_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_session_id is null then
    raise exception 'Session invalide' using errcode = '22023';
  end if;

  delete from public.cyberatelier_active_sessions
  where last_seen < now() - interval '2 minutes';

  insert into public.cyberatelier_active_sessions as current_sessions (session_id, last_seen)
  values (p_session_id, now())
  on conflict (session_id)
  do update set last_seen = excluded.last_seen;
end;
$$;

create or replace function public.get_cyberatelier_audience_stats()
returns table (
  visits bigint,
  active_sessions bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce((select total from public.cyberatelier_page_visits where singleton), 0)::bigint,
    (select count(*) from public.cyberatelier_active_sessions
      where last_seen >= now() - interval '90 seconds')::bigint;
$$;

revoke all on function public.record_cyberatelier_page_visit(uuid) from public, anon, authenticated;
revoke all on function public.heartbeat_cyberatelier_session(uuid) from public, anon, authenticated;
revoke all on function public.get_cyberatelier_audience_stats() from public, anon, authenticated;

grant execute on function public.record_cyberatelier_page_visit(uuid) to anon, authenticated;
grant execute on function public.heartbeat_cyberatelier_session(uuid) to anon, authenticated;
grant execute on function public.get_cyberatelier_audience_stats() to anon, authenticated;
