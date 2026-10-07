-- Validation used to live only in the browser, so anyone calling the API
-- directly could store any length/shape of data. NOT VALID keeps existing rows
-- from blocking the migration while every new insert/update is checked.

alter table public.profiles
  drop constraint if exists profiles_display_name_len,
  drop constraint if exists profiles_username_format,
  drop constraint if exists profiles_year_range,
  drop constraint if exists profiles_avatar_len;
alter table public.profiles
  add constraint profiles_display_name_len
    check (char_length(btrim(display_name)) between 1 and 40) not valid,
  add constraint profiles_username_format
    check (username is null or username ~ '^[a-z0-9_.]{3,24}$') not valid,
  add constraint profiles_year_range
    check (year is null or year between 1 and 5) not valid,
  add constraint profiles_avatar_len
    check (char_length(avatar_id) <= 32) not valid;

alter table public.course_ratings
  drop constraint if exists course_ratings_code_format,
  drop constraint if exists course_ratings_prof_len;
alter table public.course_ratings
  add constraint course_ratings_code_format
    check (course_code ~ '^[A-Z]{3}[0-9]{3}[HY][0-9]$') not valid,
  add constraint course_ratings_prof_len
    check (prof_name is null or char_length(prof_name) <= 80) not valid;

alter table public.shortlists
  drop constraint if exists shortlists_code_format;
alter table public.shortlists
  add constraint shortlists_code_format
    check (course_code ~ '^[A-Z]{3}[0-9]{3}[HY][0-9]$') not valid;

-- Cap friend requests so one account cannot spam the whole school.
create or replace function public.limit_friend_requests()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (
    select count(*) from public.friendships
    where requester_id = new.requester_id
      and created_at > now() - interval '1 hour'
  ) >= 30 then
    raise exception 'Too many friend requests. Try again later.'
      using errcode = 'P0001';
  end if;
  return new;
end; $$;

revoke execute on function public.limit_friend_requests() from public, anon, authenticated;

drop trigger if exists friendships_rate_limit on public.friendships;
create trigger friendships_rate_limit
  before insert on public.friendships
  for each row execute function public.limit_friend_requests();

-- New accounts used to be named after their email (e.g. "jane.doe" from
-- jane.doe@mail.utoronto.ca), and profiles are public. Use a neutral default.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(btrim(left(new.raw_user_meta_data->>'display_name', 40)), ''), 'UTM student')
  )
  on conflict (id) do nothing;
  return new;
end; $$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- OPTIONAL, run by hand if wanted: rename existing accounts whose display name
-- is still exactly their email prefix (they most likely never picked a name).
-- update public.profiles p
--   set display_name = 'UTM student'
--   from auth.users u
--   where u.id = p.id and p.display_name = split_part(u.email, '@', 1);

notify pgrst, 'reload schema';
