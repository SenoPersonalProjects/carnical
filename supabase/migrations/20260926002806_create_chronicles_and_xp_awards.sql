create schema if not exists private;

create table public.chronicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  invite_code text not null unique check (char_length(invite_code) between 16 and 64),
  xp_cost_mode text not null default 'new_level' check (xp_cost_mode in ('new_level', 'current_level')),
  rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chronicle_members (
  chronicle_id uuid not null references public.chronicles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (chronicle_id, user_id)
);
create index chronicle_members_user_idx on public.chronicle_members (user_id, chronicle_id);

alter table public.characters add column chronicle_id uuid references public.chronicles(id) on delete set null;
alter table public.characters add column creation_xp integer check (creation_xp between 0 and 1000);
create index characters_chronicle_idx on public.characters (chronicle_id) where chronicle_id is not null;

create table public.character_xp_awards (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null,
  chronicle_id uuid not null references public.chronicles(id) on delete cascade,
  character_id bigint not null references public.characters(id) on delete cascade,
  awarded_by uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount between 1 and 1000),
  note text not null default '' check (char_length(note) <= 240),
  created_at timestamptz not null default now(),
  unique (batch_id, character_id)
);
create index character_xp_awards_character_idx on public.character_xp_awards (character_id, created_at desc);
create index character_xp_awards_chronicle_idx on public.character_xp_awards (chronicle_id, created_at desc);

alter table public.chronicles enable row level security;
alter table public.chronicle_members enable row level security;
alter table public.character_xp_awards enable row level security;

create policy "Chronicles visible to owner or member" on public.chronicles for select to authenticated
  using (owner_id = (select auth.uid()) or id in (
    select chronicle_id from public.chronicle_members where user_id = (select auth.uid())
  ));
create policy "Owners create chronicles" on public.chronicles for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Owners update chronicles" on public.chronicles for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Members see own membership" on public.chronicle_members for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Chronicle owners read linked characters" on public.characters for select to authenticated
  using (chronicle_id in (select id from public.chronicles where owner_id = (select auth.uid())));
drop policy "Users can create their own characters" on public.characters;
create policy "Users can create their own characters" on public.characters for insert to authenticated
  with check (user_id = (select auth.uid()) and (chronicle_id is null or chronicle_id in (
    select id from public.chronicles where owner_id = (select auth.uid())
    union select chronicle_id from public.chronicle_members where user_id = (select auth.uid())
  )));
drop policy "Users can update their own characters" on public.characters;
create policy "Users can update their own characters" on public.characters for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and (chronicle_id is null or chronicle_id in (
    select id from public.chronicles where owner_id = (select auth.uid())
    union select chronicle_id from public.chronicle_members where user_id = (select auth.uid())
  )));

create policy "Awards visible to player or narrator" on public.character_xp_awards for select to authenticated
  using (character_id in (select id from public.characters where user_id = (select auth.uid()))
    or chronicle_id in (select id from public.chronicles where owner_id = (select auth.uid())));
create policy "Only narrator grants XP" on public.character_xp_awards for insert to authenticated
  with check (awarded_by = (select auth.uid())
    and chronicle_id in (select id from public.chronicles where owner_id = (select auth.uid()))
    and exists (select 1 from public.characters c where c.id = character_id and c.chronicle_id = chronicle_id));

create function private.join_chronicle_by_code(p_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_chronicle uuid;
begin
  if v_user is null or char_length(trim(p_code)) < 16 then
    raise exception 'Código inválido';
  end if;
  select c.id into v_chronicle from public.chronicles c where c.invite_code = upper(trim(p_code));
  if v_chronicle is null then raise exception 'Código não encontrado'; end if;
  insert into public.chronicle_members (chronicle_id, user_id) values (v_chronicle, v_user)
    on conflict do nothing;
  return v_chronicle;
end;
$$;
revoke all on function private.join_chronicle_by_code(text) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.join_chronicle_by_code(text) to authenticated;
create function public.join_chronicle_by_code(p_code text) returns uuid
language sql security invoker set search_path = '' as $$
  select private.join_chronicle_by_code(p_code);
$$;
revoke all on function public.join_chronicle_by_code(text) from public, anon;
grant execute on function public.join_chronicle_by_code(text) to authenticated;

create function private.sync_character_chronicle() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_name text; v_rules jsonb; v_awards integer;
begin
  if new.chronicle_id is null then
    new.creation_xp := null;
    return new;
  end if;
  if tg_op = 'INSERT' or old.chronicle_id is distinct from new.chronicle_id then
    new.creation_xp := case new.data->>'ageCategory'
      when 'Neófito' then 15 when 'Ancilla' then 35 else 0 end;
  else
    new.creation_xp := old.creation_xp;
  end if;
  select c.name, c.rules into v_name, v_rules from public.chronicles c where c.id = new.chronicle_id;
  select coalesce(sum(a.amount), 0) into v_awards from public.character_xp_awards a where a.character_id = new.id;
  new.data := jsonb_set(coalesce(new.data, '{}'::jsonb), '{chronicle}', to_jsonb(v_name), true);
  new.data := jsonb_set(new.data, '{chronicleRules}', coalesce(v_rules, '{}'::jsonb), true);
  new.data := jsonb_set(new.data, '{xpTotal}', to_jsonb(((new.creation_xp + v_awards)::text)), true);
  return new;
end;
$$;
create trigger sync_character_chronicle_before_save before insert or update on public.characters
  for each row execute function private.sync_character_chronicle();

grant select, insert, update on public.chronicles to authenticated;
grant select on public.chronicle_members to authenticated;
grant select, insert on public.character_xp_awards to authenticated;
