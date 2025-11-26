-- 20251128_economic_series_revenue_segmentation.sql
-- Adds JSONB columns for booster revenue segmentation by type and channel + period deltas.

alter table public.economic_series
  add column if not exists booster_revenue_by_type_cents jsonb,
  add column if not exists booster_revenue_by_channel_cents jsonb,
  add column if not exists period_booster_revenue_by_type_cents jsonb,
  add column if not exists period_booster_revenue_by_channel_cents jsonb;
