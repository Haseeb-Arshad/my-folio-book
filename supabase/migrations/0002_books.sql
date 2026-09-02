-- Personal reading history, shown on the Reading page.
--
-- Same access model as 0001_content.sql: read exclusively by the site's own
-- server with the secret key (service_role, BYPASSRLS). RLS is enabled and
-- forced with no anon/authenticated policies, so a table accidentally
-- exposed through Data API settings is still unreadable by the publishable
-- key.

create table if not exists public.books (
  id           bigint generated always as identity primary key,
  slug         text not null unique,
  title        text not null,
  author       text not null,
  -- ISBN-13, used to build the Open Library cover URL. Nullable: a cover
  -- falls back to a plain letter tile in the UI when this is absent.
  isbn13       text,
  genres       text[] not null default '{}',
  note         text not null,
  favorite     boolean not null default false,
  sort_order   integer not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint books_isbn13_format check (isbn13 is null or isbn13 ~ '^[0-9]{13}$')
);

create index if not exists books_published_order_idx
  on public.books (sort_order) where published;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

alter table public.books enable row level security;
alter table public.books force row level security;
revoke all on public.books from anon, authenticated;
