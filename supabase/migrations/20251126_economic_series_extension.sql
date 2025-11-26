-- Migration extension (unique version 20251126): adiciona campos de marketplace e reciclagem à economic_series
-- Idempotente: usa add column if not exists e create or replace view.

alter table public.economic_series
  add column if not exists market_listings_cum integer not null default 0,
  add column if not exists market_trades_cum integer not null default 0,
  add column if not exists market_volume_cents_cum bigint not null default 0,
  add column if not exists market_fee_cents_cum bigint not null default 0,
  add column if not exists market_floor_rejections_cum integer not null default 0,
  add column if not exists period_market_listings integer not null default 0,
  add column if not exists period_market_trades integer not null default 0,
  add column if not exists period_market_volume_cents bigint not null default 0,
  add column if not exists period_market_fee_cents integer not null default 0,
  add column if not exists period_market_floor_rejections integer not null default 0,
  add column if not exists recycle_conversions_cum integer not null default 0,
  add column if not exists recycle_value_cents_cum bigint not null default 0,
  add column if not exists period_recycle_conversions integer not null default 0,
  add column if not exists period_recycle_value_cents bigint not null default 0;

create or replace view public.economic_series_head as
select id, ts,
       booster_opens_cum,
       jackpot_hits_cum,
       jackpot_payout_cents_cum,
       jackpot_avg_payout_cents,
       period_booster_opens,
       period_jackpot_hits,
       period_jackpot_payout_cents,
       market_listings_cum,
       market_trades_cum,
       market_volume_cents_cum,
       market_fee_cents_cum,
       recycle_conversions_cum,
       recycle_value_cents_cum,
       period_market_trades,
       period_recycle_conversions
from public.economic_series
order by ts desc;