"""
Explica a distribuição de liquidez para RTP 70%

Cenário: Booster Básico (R$ 0.50)
- 5 cartas por abertura
- RTP 70% = R$ 0.35 de retorno esperado
- R$ 0.35 / 5 cartas = R$ 0.07 média por carta

Mas precisamos considerar as probabilidades de cada raridade!
"""

# Probabilidades do Básico Alpha (exemplo)
RARITY_PROBS = {
    'trash': 0.70,      # 70%
    'meme': 0.20,       # 20%
    'viral': 0.08,      # 8%
    'legendary': 0.015, # 1.5%
    'godmode': 0.005    # 0.5%
}

TARGET_RTP = 0.70
BOOSTER_PRICE = 0.50
CARDS_PER_PACK = 5

# Valor esperado por carta
expected_value_per_card = (BOOSTER_PRICE * TARGET_RTP) / CARDS_PER_PACK

print("="*80)
print("🎰 CÁLCULO DE LIQUIDEZ PARA RTP 70%")
print("="*80)
print(f"\n💰 Booster: R$ {BOOSTER_PRICE:.2f}")
print(f"🎯 RTP Target: {TARGET_RTP*100:.0f}%")
print(f"📦 Cartas por pack: {CARDS_PER_PACK}")
print(f"💵 Retorno esperado: R$ {BOOSTER_PRICE * TARGET_RTP:.2f}")
print(f"📊 Valor médio por carta: R$ {expected_value_per_card:.3f}")

print("\n" + "="*80)
print("📈 DISTRIBUIÇÃO POR RARIDADE")
print("="*80)

# Para calcular a liquidez, precisamos resolver:
# Σ (prob[rarity] × liquidity[rarity]) = expected_value_per_card

# Sistema de equações (exemplo simplificado):
# 0.70 × trash + 0.20 × meme + 0.08 × viral + 0.015 × legendary + 0.005 × godmode = 0.07

# Vamos usar uma proporção realista:
# - Trash deve valer algo (não zero)
# - Godmode deve valer muito mais
# - Proporção: 1x : 3x : 10x : 30x : 100x

BASE_MULTIPLIERS = {
    'trash': 1,
    'meme': 3,
    'viral': 10,
    'legendary': 30,
    'godmode': 100
}

# Calcular o denominador da equação
denominator = sum(RARITY_PROBS[r] * BASE_MULTIPLIERS[r] for r in RARITY_PROBS)

# Calcular a base
base_value = expected_value_per_card / denominator

print("\n🎲 VALORES CALCULADOS:")
print("-" * 80)
print(f"{'Raridade':<12} {'Prob':<8} {'Mult':<6} {'Liquidez':<12} {'Contribuição'}")
print("-" * 80)

total_contribution = 0
for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
    prob = RARITY_PROBS[rarity]
    mult = BASE_MULTIPLIERS[rarity]
    liquidity = base_value * mult
    contribution = prob * liquidity
    total_contribution += contribution
    
    print(f"{rarity:<12} {prob*100:>6.1f}% {mult:>4}x  R$ {liquidity:>8.4f}  R$ {contribution:.4f}")

print("-" * 80)
print(f"{'TOTAL':<28} R$ {total_contribution:.4f} (esperado: R$ {expected_value_per_card:.4f})")

print("\n" + "="*80)
print("💡 RANGES SUGERIDOS (com variação)")
print("="*80)

# Aplicar variação de ±30% para criar ranges
for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
    mult = BASE_MULTIPLIERS[rarity]
    base_liq = base_value * mult
    min_liq = base_liq * 0.7  # -30%
    max_liq = base_liq * 1.3  # +30%
    
    print(f"{rarity.upper():<12}: R$ {min_liq:.4f} - R$ {max_liq:.4f}")

print("\n" + "="*80)
print("✅ COM ESTES VALORES:")
print("="*80)
print(f"• Trash NÃO vale zero (vale ~R$ {base_value:.4f})")
print(f"• Godmode vale ~100x mais ({base_value * 100:.2f})")
print(f"• RTP médio: ~{TARGET_RTP*100:.0f}%")
print(f"• Players sentem progressão de valor")
print("="*80)
