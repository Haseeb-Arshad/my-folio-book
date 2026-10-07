-- A separate editor store for /new. Existing portfolio content is untouched.
-- Every mutation is a version-checked update of one row, so the draft,
-- published snapshot and revision history are committed together.
create table if not exists public.portfolio_editor_state (
  id text primary key check (id = 'portfolio'),
  version integer not null default 0 check (version >= 0),
  entries jsonb not null default '[]'::jsonb check (jsonb_typeof(entries) = 'array'),
  updated_at timestamptz not null default now()
);
alter table public.portfolio_editor_state enable row level security;
alter table public.portfolio_editor_state force row level security;
revoke all on public.portfolio_editor_state from public, anon, authenticated;
grant select, insert, update on public.portfolio_editor_state to service_role;
