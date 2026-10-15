create table if not exists public.ai_usage_daily (
  surface text not null default 'local'
    check (surface in ('local', 'cloud')),
  account_id text not null
    check (
      account_id in ('shared', 'unattributed')
      or account_id ~ '^[a-f0-9]{64}$'
    ),
  account_label text not null
    check (length(account_label) between 1 and 80),
  provider_id text not null
    check (provider_id in ('amp', 'claude', 'codex', 'cursor', 'gemini', 'opencode', 'pi')),
  usage_date date not null,
  input_tokens bigint not null default 0 check (input_tokens >= 0),
  output_tokens bigint not null default 0 check (output_tokens >= 0),
  cache_input_tokens bigint not null default 0 check (cache_input_tokens >= 0),
  cache_output_tokens bigint not null default 0 check (cache_output_tokens >= 0),
  total_tokens bigint not null default 0 check (total_tokens >= 0),
  updated_at timestamptz not null default now(),
  primary key (surface, account_id, provider_id, usage_date)
);

create index if not exists ai_usage_daily_usage_date_idx
  on public.ai_usage_daily (usage_date desc);

alter table public.ai_usage_daily enable row level security;
alter table public.ai_usage_daily force row level security;

revoke all on table public.ai_usage_daily from public, anon, authenticated;
grant select, insert, update on table public.ai_usage_daily to service_role;

comment on table public.ai_usage_daily is
  'Daily token aggregates only. Account identifiers are SHA-256 hashes; raw session files and prompts are never stored.';
