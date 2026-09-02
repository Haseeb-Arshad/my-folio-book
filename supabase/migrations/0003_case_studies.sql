-- Long-form case studies, attached to an experience entry by `org` and to a
-- project by `slug`.
--
-- Same access model as 0001_content.sql: read exclusively by the site's own
-- server with the secret key (service_role, BYPASSRLS). RLS is enabled and
-- forced with no anon/authenticated policies, so a table accidentally exposed
-- through Data API settings is still unreadable by the publishable key.
--
-- `published` defaults to FALSE here, unlike every other content table. A
-- case study about employer work should not go live by accident before its
-- clearance is settled. Flip it deliberately, once.

create table if not exists public.case_studies (
  id           bigint generated always as identity primary key,
  slug         text not null unique,
  title        text not null,
  summary      text not null,
  org          text not null,
  role         text not null,
  team         text not null,
  stack        text[] not null default '{}',
  scope        text not null,
  -- ~150 words, standalone: used on cards, previews, and by the site's
  -- conversational agent, so it has to make sense with no page around it.
  excerpt      text not null,
  -- The body, as an ordered array of typed blocks. Structured rather than
  -- markdown because the site has no markdown renderer and these pages only
  -- use a handful of shapes. See app/data/case-studies.ts for the type.
  sections     jsonb not null default '[]'::jsonb,
  -- One line naming where the evidence for this write-up is kept.
  provenance   text not null default '',
  -- Disclosure tier the write-up was cleared at, per the project's own
  -- clearance record. Kept here so it is visible next to the content.
  tier         text not null default 'internal-safe',
  sort_order   integer not null default 0,
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint case_studies_tier_known
    check (tier in ('public', 'internal-safe', 'restricted')),
  constraint case_studies_sections_is_array
    check (jsonb_typeof(sections) = 'array')
);

create index if not exists case_studies_published_order_idx
  on public.case_studies (sort_order) where published;

-- The Work page groups case studies under the job they belong to.
create index if not exists case_studies_org_idx
  on public.case_studies (org) where published;

drop trigger if exists case_studies_set_updated_at on public.case_studies;
create trigger case_studies_set_updated_at
  before update on public.case_studies
  for each row execute function public.set_updated_at();

alter table public.case_studies enable row level security;
alter table public.case_studies force row level security;
revoke all on public.case_studies from anon, authenticated;
