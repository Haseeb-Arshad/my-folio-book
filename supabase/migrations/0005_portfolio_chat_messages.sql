-- Conversation turns for the public portfolio agent.
--
-- This table is intentionally server-only. The portfolio uses the Supabase
-- secret key on its own server, so visitors can send turns through the app
-- without receiving read access to anyone else's conversation.

create table if not exists public.portfolio_chat_messages (
  id                bigint generated always as identity primary key,
  visitor_id        uuid not null,
  conversation_id   uuid not null,
  surface           text not null,
  mode              text not null,
  role              text not null,
  content           text not null,
  status            text not null default 'completed',
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  constraint portfolio_chat_surface_known check (surface in ('home', 'resume')),
  constraint portfolio_chat_mode_known check (mode in ('plain', 'goblin')),
  constraint portfolio_chat_role_known check (role in ('user', 'assistant')),
  constraint portfolio_chat_status_known check (status in ('completed', 'failed', 'truncated')),
  constraint portfolio_chat_content_is_text check (char_length(content) between 1 and 4000),
  constraint portfolio_chat_metadata_is_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists portfolio_chat_conversation_created_idx
  on public.portfolio_chat_messages (conversation_id, created_at);
create index if not exists portfolio_chat_visitor_created_idx
  on public.portfolio_chat_messages (visitor_id, created_at);
create index if not exists portfolio_chat_surface_created_idx
  on public.portfolio_chat_messages (surface, created_at);

alter table public.portfolio_chat_messages enable row level security;
alter table public.portfolio_chat_messages force row level security;
revoke all on public.portfolio_chat_messages from anon, authenticated;
