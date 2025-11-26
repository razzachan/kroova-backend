-- Migration: economic_series (fase 1 - armazenamento de série econômica longitudinal)
-- Estrutura minimalista focada em leitura sequencial por timestamp.
-- Futuro: adicionar assinatura (hmac), prev_hash para cadeia de integridade.

create table if not exists public.economic_series (
  id uuid primary key default gen_random_uuid(),
  ts timestamptz not null default now(),
  rarity_pct jsonb not null,              -- { trash: %, meme: %, ... }
  skin_pct jsonb not null,                -- { default: %, neon: %, ... }
  booster_opens_cum integer not null,     -- cumulativo
  jackpot_hits_cum integer not null,      -- cumulativo
  jackpot_payout_cents_cum bigint not null, -- soma em cents
  jackpot_avg_payout_cents numeric(14,4) not null, -- média acumulada (cents)
  period_jackpot_hits integer not null,   -- delta
  period_jackpot_payout_cents bigint not null, -- delta
  period_booster_opens integer not null,  -- delta
  alerts jsonb not null,                  -- { rarityPositive, rarityNegative, skinPositive, skinNegative }
  -- Campos futuros para integridade (placeholders):
  hash text,          -- sha256(canonical)
  prev_hash text,     -- referência hash anterior
  hmac text           -- hmac sha256 opcional
);

-- Índices para consulta temporal
create index if not exists economic_series_ts_idx on public.economic_series (ts desc);

-- View resumida (exemplo) - permite filtrar campos principais sem json completo
create or replace view public.economic_series_head as
select id, ts,
       booster_opens_cum,
       jackpot_hits_cum,
       jackpot_payout_cents_cum,
       jackpot_avg_payout_cents,
       period_booster_opens,
       period_jackpot_hits,
       period_jackpot_payout_cents
from public.economic_series
order by ts desc;

-- NOTE: RLS pode ser adicionada posteriormente (apenas acesso interno).