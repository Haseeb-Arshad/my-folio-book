create table if not exists public.portfolio_agent_events (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  conversation_id uuid not null,
  surface text not null,
  mode text not null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint portfolio_agent_events_surface_check
    check (surface in ('home', 'resume')),
  constraint portfolio_agent_events_mode_check
    check (mode in ('plain', 'goblin')),
  constraint portfolio_agent_events_type_check
    check (event_type in (
      'agent_opened',
      'agent_message_sent',
      'agent_reply_completed',
      'agent_reply_failed',
      'agent_conversation_reset',
      'agent_mode_changed'
    )),
  constraint portfolio_agent_events_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create index if not exists portfolio_agent_events_conversation_created_idx
  on public.portfolio_agent_events (conversation_id, created_at);
create index if not exists portfolio_agent_events_visitor_created_idx
  on public.portfolio_agent_events (visitor_id, created_at);
create index if not exists portfolio_agent_events_type_created_idx
  on public.portfolio_agent_events (event_type, created_at);

alter table public.portfolio_agent_events enable row level security;
alter table public.portfolio_agent_events force row level security;
revoke all on table public.portfolio_agent_events from anon, authenticated;
