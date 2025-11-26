alter table public.deviation_threshold_changes
  add column if not exists reason text,
  add column if not exists hash text;

create index if not exists deviation_threshold_changes_hash_idx on public.deviation_threshold_changes (hash);
