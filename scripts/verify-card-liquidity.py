#!/usr/bin/env python3
"""Verificar liquidez das cartas vs raridade"""

import os
import requests
from dotenv import load_dotenv
from collections import defaultdict

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json'
}

print("=" * 80)
print("💰 VERIFICANDO LIQUIDEZ DAS CARTAS VS RARIDADE")
print("=" * 80)

# Buscar todas as cartas
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/cards_base",
    headers=headers,
    params={'select': 'id,name,rarity,base_liquidity_brl', 'order': 'base_liquidity_brl.desc'}
)

cards = response.json()
print(f"\n📊 Total de cartas: {len(cards)}")

# Agrupar por raridade
by_rarity = defaultdict(list)
for card in cards:
    by_rarity[card['rarity']].append(card)

# Analisar cada raridade
print("\n" + "=" * 80)
print("📈 ANÁLISE POR RARIDADE")
print("=" * 80)

for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
    cards_in_rarity = by_rarity[rarity]
    if not cards_in_rarity:
        continue
    
    liquidities = [c['base_liquidity_brl'] for c in cards_in_rarity]
    avg_liq = sum(liquidities) / len(liquidities)
    min_liq = min(liquidities)
    max_liq = max(liquidities)
    
    print(f"\n{'='*80}")
    print(f"🎯 {rarity.upper()}")
    print(f"{'='*80}")
    print(f"Quantidade: {len(cards_in_rarity)} cartas")
    print(f"Liquidez Média: R$ {avg_liq:.4f}")
    print(f"Liquidez Min: R$ {min_liq:.4f}")
    print(f"Liquidez Max: R$ {max_liq:.4f}")
    print(f"Range: R$ {max_liq - min_liq:.4f}")
    
    # Top 5 mais valiosas
    print(f"\n🔝 Top 5 mais valiosas:")
    for i, card in enumerate(sorted(cards_in_rarity, key=lambda x: x['base_liquidity_brl'], reverse=True)[:5], 1):
        print(f"  {i}. {card['name']}: R$ {card['base_liquidity_brl']:.4f}")
    
    # Bottom 5 menos valiosas
    print(f"\n⬇️ Bottom 5 menos valiosas:")
    for i, card in enumerate(sorted(cards_in_rarity, key=lambda x: x['base_liquidity_brl'])[:5], 1):
        print(f"  {i}. {card['name']}: R$ {card['base_liquidity_brl']:.4f}")

# Verificar se há inversões (carta trash mais cara que legendary)
print("\n" + "=" * 80)
print("⚠️ VERIFICANDO INVERSÕES DE VALOR")
print("=" * 80)

trash_max = max([c['base_liquidity_brl'] for c in by_rarity['trash']])
meme_max = max([c['base_liquidity_brl'] for c in by_rarity['meme']])
viral_max = max([c['base_liquidity_brl'] for c in by_rarity['viral']])
legendary_min = min([c['base_liquidity_brl'] for c in by_rarity['legendary']])

print(f"\nTrash Max: R$ {trash_max:.4f}")
print(f"Meme Max: R$ {meme_max:.4f}")
print(f"Viral Max: R$ {viral_max:.4f}")
print(f"Legendary Min: R$ {legendary_min:.4f}")

if trash_max > legendary_min:
    print(f"\n❌ INVERSÃO: Trash max (R$ {trash_max:.4f}) > Legendary min (R$ {legendary_min:.4f})")
else:
    print(f"\n✅ OK: Hierarquia de valores respeitada")

# Expectativa teórica
print("\n" + "=" * 80)
print("📊 EXPECTATIVA TEÓRICA vs REAL")
print("=" * 80)

expected = {
    'trash': (0.01, 0.10),
    'meme': (0.10, 0.50),
    'viral': (0.50, 2.00),
    'legendary': (2.00, 10.00),
    'godmode': (10.00, 50.00)
}

for rarity, (exp_min, exp_max) in expected.items():
    if rarity not in by_rarity:
        continue
    
    cards_in_rarity = by_rarity[rarity]
    liquidities = [c['base_liquidity_brl'] for c in cards_in_rarity]
    avg_liq = sum(liquidities) / len(liquidities)
    min_liq = min(liquidities)
    max_liq = max(liquidities)
    
    within_range = exp_min <= avg_liq <= exp_max
    status = "✅" if within_range else "⚠️"
    
    print(f"\n{rarity.upper()}:")
    print(f"  Esperado: R$ {exp_min:.2f} - R$ {exp_max:.2f}")
    print(f"  Real: R$ {min_liq:.4f} - R$ {max_liq:.4f} (média R$ {avg_liq:.4f})")
    print(f"  {status} {'Dentro do esperado' if within_range else 'FORA DO ESPERADO'}")

print("\n" + "=" * 80)
