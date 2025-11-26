alter table public.deviation_threshold_changes
  add column if not exists hmac text;
create index if not exists deviation_threshold_changes_hmac_idx on public.deviation_threshold_changes (hmac);
