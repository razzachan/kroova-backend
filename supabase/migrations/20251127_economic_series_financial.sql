-- 20251127_economic_series_financial.sql
-- Adds booster revenue + derived RTP and gross margin columns to economic_series.

alter table public.economic_series
  add column if not exists booster_revenue_cents_cum bigint not null default 0,
  add column if not exists period_booster_revenue_cents bigint not null default 0,
  add column if not exists rtp_pct numeric(10,4),
  add column if not exists gross_margin_pct numeric(10,4);
