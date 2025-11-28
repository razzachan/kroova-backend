# KROOVA Economy Balance Snapshot – Edition ED01

Date: 2025-11-27

## Current Core Parameters
- Base Liquidity (BRL per rarity):
  - trash: 0.01
  - meme: 0.03
  - viral: 0.10
  - legendary: 0.50
  - epica: 1.00 (currently unused in distributions)
- Skin Multipliers:
  - default 1.0, neon 1.2, glow 1.5, glitch 2.0, ghost 3.0, holo 3.0, dark 3.0
- Godmode:
  - probability: 1.0% per booster (single card when triggered)
  - multiplier: 10× applied to first card only
  - pity threshold: 180 boosters (forces godmode + reset)

## Booster Configurations
### Booster Micro
- price_multiplier: 2.5 (Preço R$ 0,50)
- cards_per_booster: 1
- rarity_distribution (%): trash 60, meme 28, viral 10, legendary 2
- guaranteed_cards: none

### Booster Premium
- price_multiplier: 20
- cards_per_booster: 10
- rarity_distribution (%): trash 28, meme 33, viral 27, legendary 12 (sums 100%)
- guaranteed_cards: 1× viral (boosts perceived win floor)

### Booster Lendário
### Booster Básico
- price_multiplier: 12 (Preço R$ 25)
- cards_per_booster: 5
- rarity_distribution (%): trash 45, meme 33, viral 18, legendary 4 (sums 100%)
- guaranteed_cards: 1× meme (perceived-win floor)

### Booster Lendário
- price_multiplier: 20 (Preço R$ 250)
- cards_per_booster: 15
- rarity_distribution (%): trash 18, meme 27, viral 32, legendary 23 (sums 100%)
- guaranteed_cards: 1× legendary (assured high-tier hit)

## Jackpots (Raspadinha) – Live DB (ED01)
- Booster Micro: grand 0.001% ×500, major 0.02% ×100, minor 0.5% ×10
  - EV jackpots ≈ 0.075 × price_brl (top prize R$ 250.00)
- Booster Básico: grand 0.002% ×500, major 0.05% ×100, minor 0.8% ×10
  - EV jackpots ≈ 0.14 × price_brl (top prize R$ 12,500.00)
- Booster Premium: grand 0.001% ×200, major 0.02% ×50, minor 0.55% ×10
  - EV jackpots ≈ 0.067 × price_brl (top prize R$ 15,000.00)
- Booster Lendário: grand 0.01% ×100, major 0.04% ×25, minor 0.6% ×5
  - EV jackpots ≈ 0.05 × price_brl (top prize R$ 25,000.00)

## RTP Targets
- Premium target band: 25–35%
- Lendário target band: 15–25%

## Simulation Results (Jackpots Enabled)
- Micro (50k): RTP 27.43%; Max seen R$ 51.25; Jackpot max observed R$ 50.00 (grand possible R$ 250.00)
- Básico (20k): RTP 26.73%; Max seen R$ 2,506.96; Jackpot max R$ 2,500.00
- Premium (20k): RTP 33.38% (within 25–35% target); Max seen R$ 3,768.40; Jackpot max R$ 3,750.00
- Lendário (20k): RTP 23.44% (within 15–25% target); Max seen R$ 25,051.80; Jackpot max R$ 25,000.00

## Theoretical Model (Post Meme Buff)
- Premium theoretical RTP: ~32.75% (empirical settling lower ~26–27%)
- Lendário theoretical RTP: ~21.13% (empirical ~17%)

Difference explained by:
1. Godmode not always hitting high-value legendary cards in practice
2. Higher than expected trash frequency reducing average liquidity
3. Variance + single-card godmode cap trimming peak liquidity distribution

## Recent Changes Applied
1. Reduced legendary and viral base liquidity to compress RTP
2. Equalized high-tier booster price multiplier (Lendário 50 → 20) for margin stabilization
3. Increased pity threshold (100 → 180) to reduce effective godmode rate inflation
4. Adjusted rarity distributions to lessen trash and improve perception of mid-tier wins

## Remaining Improvement Opportunities
- Add guaranteed rarity support in schema (booster_types.guaranteed_cards JSONB) to activate perceived-win floor.
- Normalize trash frequency (ensure distributions sum 100% and remove unused keys like godmode from rarity_distribution).
- Fine-tune godmode effective rate: increase pity threshold further (e.g., 220) or decay pity if godmode triggered early.
- Introduce micro-jackpot tier (0.5% chance ×4 multiplier) to smooth variance without large RTP impact.
- Add progression rewards (XP/shards) for Lendário to differentiate now that price multipliers match.

## Recommended Next Micro-Tweaks (Optional)
1. Implement guaranteed_cards column and re-run to confirm uplift in perceived wins without breaking RTP.
2. Adjust Premium distribution to: trash 27, meme 33, viral 28, legendary 12.
3. Adjust Lendário distribution to: trash 17, meme 27, viral 33, legendary 23.
4. Track godmode occurrences per 5k boosters after increasing pity to 220.

## Monitoring Plan
- Daily aggregate: boosters opened, RTP per booster type, godmode_count, average liquidity per rarity and skin.
- Alert thresholds:
  - Premium RTP > 36% (investigate liquidity inflation)
  - Lendário RTP > 26% (check legendary liquidity / multiplier leaks)
  - Godmode rate > 2% sustained over 10k boosters (check pity or forced triggers)

## Change Log
- 2025-11-27: Applied liquidity rebalance, meme buff, pity threshold increase, rarity distribution adjustments, documented snapshot.
- 2025-11-27: Added guaranteed_cards column; activated guaranteed viral (Premium) and guaranteed legendary (Lendário); validated RTP stability.
- 2025-11-27: Added jackpot_tiers to edition_configs; applied tiers for all boosters (Micro/Básico/Premium/Lendário); validated RTP against targets.

---
Generated automatically. Update this file whenever economic parameters change.
