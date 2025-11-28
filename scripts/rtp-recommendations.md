# RTP Recommendations (ED01)

Goal: Balance retention with healthy margins. Target RTP per tier:
- Basico/Básico loop: 35–45%
- Premium mid/high: 25–35%
- Lendário top: 10–25%

Summary of current simulations (2,000–3,000 opens):
- Basico: RTP ~128%, Godmode ~5.9% (expected 1%)
- Booster Básico (R$25): RTP ~42.7%, Godmode ~5.0%
- Booster Premium (R$75): RTP ~189.8%, Godmode ~9.5%
- Booster Lendário (R$250): RTP ~406.9%, Godmode ~13.4%

Key issues:
- Godmode probability realized >> configured (suggests implementation bug allowing compounding or per-card chance rather than per-booster/session cap).
- High-tier multipliers produce extremely high godmode value spikes (jackpots) raising RTP.

Recommended changes:

1) Enforce godmode probability to ≤1% realized
- Implement a hard cap per booster: at most 1 godmode per booster; probability per booster = 1% (not per card).
- Add session pity accumulation that influences rarity only, not godmode.

2) Adjust price_multipliers (temporary fix to hit RTP quickly)
- Basico `×1` → keep but reduce base_liquidity for low rarities by ~20%.
- Booster Básico `×15` → `×12`.
- Booster Premium `×45` → `×20`.
- Booster Lendário `×150` → `×50`.

3) Rarity weights per tier
- Premium/Lendário: increase trash share by +5–10pp and reduce legendary by -3–5pp unless godmode triggers.

4) Skin multipliers
- Cap holo/dark skin multipliers to avoid >R$2,000 single-card outcomes except when godmode.

Expected RTP after changes (estimates):
- Basico: 40–50% (needs godmode fix to settle at 40–45%).
- Booster Básico: 35–45%.
- Booster Premium: 25–35%.
- Booster Lendário: 15–25%.

Next steps:
- Apply multiplier changes via `scripts/fix-price-multipliers.js` variant.
- Patch open algorithm to enforce godmode cap and probability per booster.
- Re-run `scripts/simulate-booster-rtp.py` and iterate.
