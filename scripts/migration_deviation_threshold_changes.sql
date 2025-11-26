-- Tabela para histórico de mudanças de thresholds de desvio
create table if not exists public.deviation_threshold_changes (
  id uuid primary key default gen_random_uuid(),
  ts timestamptz not null default now(),
  actor text,
  before jsonb not null,
  after jsonb not null
);
create index if not exists deviation_threshold_changes_ts_idx on public.deviation_threshold_changes (ts desc);
