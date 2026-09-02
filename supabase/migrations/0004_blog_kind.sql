-- The Reading page shows two kinds of link under `blogs`: long essays worth
-- re-reading, and sites/tools worth keeping open. They render in separate
-- sections, so the row needs to say which it is.
--
-- Re-runnable like the earlier migrations: the column add is guarded, the
-- constraint is added only if absent, and the backfill is idempotent.

alter table public.blogs
  add column if not exists kind text not null default 'essay';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'blogs_kind_known'
  ) then
    alter table public.blogs
      add constraint blogs_kind_known check (kind in ('essay', 'site'));
  end if;
end $$;

update public.blogs
  set kind = 'site'
  where url in (
    'https://www.writewithprl.com/',
    'https://alembic.space/'
  );
