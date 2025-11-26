alter table public.deviation_threshold_changes
  add column if not exists prev_hash text;
create index if not exists deviation_threshold_changes_prev_hash_idx on public.deviation_threshold_changes (prev_hash);
