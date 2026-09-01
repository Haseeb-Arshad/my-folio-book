-- Portfolio content tables.
--
-- Access model: these are read exclusively by the site's own server using the
-- secret key, which authenticates as service_role and carries BYPASSRLS. The
-- browser never talks to Supabase directly, so there is no reason to expose
-- these through the Data API.
--
-- Every table therefore gets RLS enabled AND forced, with no anon or
-- authenticated policies, plus an explicit revoke. The result is that a table
-- accidentally exposed through Data API settings is still unreadable by the
-- publishable key. If you later want browser-side reads, add a policy such as
--   create policy projects_public_read on public.projects
--     for select to anon using (published);
-- rather than loosening the grants.

-- ─────────────────────────────────────────────────────────────
-- Shared updated_at trigger
-- search_path is pinned to defeat search_path hijacking.
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- projects
-- ─────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id                bigint generated always as identity primary key,
  slug              text not null unique,
  name              text not null,
  tagline           text not null,
  year              text not null,
  stack             text[] not null default '{}',
  live_url          text,
  code_url          text not null,
  logo              text,
  letter            text not null,
  color             text not null,
  status            text,
  links             jsonb not null default '[]'::jsonb,
  popup_image       text,
  popup_description text,
  sort_order        integer not null default 0,
  published         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint projects_status_known check (status is null or status in ('building')),
  constraint projects_links_is_array check (jsonb_typeof(links) = 'array')
);

-- ─────────────────────────────────────────────────────────────
-- experience
-- ─────────────────────────────────────────────────────────────
create table if not exists public.experience (
  id         bigint generated always as identity primary key,
  slug       text not null unique,
  role       text not null,
  org        text not null,
  year       text not null,
  summary    text not null,
  stack      text[] not null default '{}',
  bullets    text[] not null default '{}',
  sort_order integer not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- blogs: the reading list
-- ─────────────────────────────────────────────────────────────
create table if not exists public.blogs (
  id         bigint generated always as identity primary key,
  title      text not null,
  author     text not null,
  url        text not null unique,
  note       text not null,
  featured   boolean not null default false,
  sort_order integer not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- posts: Haseeb's own writing
-- ─────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id         bigint generated always as identity primary key,
  slug       text not null unique,
  title      text not null,
  label      text not null,
  url        text not null,
  summary    text not null,
  sort_order integer not null default 0,
  published  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- live_notes: facts that change faster than a deploy.
-- Read by the conversation agent and injected as DATA, never as
-- instructions. The length limits mirror the caps in
-- app/agent/prompt.server.ts so an over-long row cannot silently
-- consume the model's context.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.live_notes (
  id         bigint generated always as identity primary key,
  label      text not null,
  value      text not null,
  sort_order integer not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint live_notes_label_len check (char_length(label) between 1 and 60),
  constraint live_notes_value_len check (char_length(value) between 1 and 240)
);

-- ─────────────────────────────────────────────────────────────
-- Indexes. Every read is "published rows, in order", so a partial
-- index on the ordering column is the shape that matches.
-- ─────────────────────────────────────────────────────────────
create index if not exists projects_published_order_idx
  on public.projects (sort_order) where published;
create index if not exists experience_published_order_idx
  on public.experience (sort_order) where published;
create index if not exists blogs_published_order_idx
  on public.blogs (sort_order) where published;
create index if not exists posts_published_order_idx
  on public.posts (sort_order) where published;
create index if not exists live_notes_published_order_idx
  on public.live_notes (sort_order) where published;

-- ─────────────────────────────────────────────────────────────
-- updated_at triggers
-- ─────────────────────────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array['projects','experience','blogs','posts','live_notes']
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_set_updated_at', t);
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end
$$;

-- ─────────────────────────────────────────────────────────────
-- Row Level Security: on, forced, and closed.
-- No policies are created, so only BYPASSRLS roles (service_role,
-- postgres) can read. force is set so the table owner is subject to
-- RLS too, rather than quietly seeing everything.
-- ─────────────────────────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array['projects','experience','blogs','posts','live_notes']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end
$$;
