-- Rockfello — schéma de sauvegarde cloud.
-- À exécuter une fois dans Supabase : Dashboard → SQL Editor → coller → Run.

-- Une ligne par joueur. `data` contient l'instantané JSON de la partie
-- (le même objet que la sauvegarde localStorage).
create table if not exists public.saves (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Sécurité au niveau ligne : un joueur ne voit et ne modifie QUE sa propre ligne.
alter table public.saves enable row level security;

drop policy if exists "saves_select_own" on public.saves;
create policy "saves_select_own"
  on public.saves for select
  using (auth.uid() = user_id);

drop policy if exists "saves_insert_own" on public.saves;
create policy "saves_insert_own"
  on public.saves for insert
  with check (auth.uid() = user_id);

drop policy if exists "saves_update_own" on public.saves;
create policy "saves_update_own"
  on public.saves for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
