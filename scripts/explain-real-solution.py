#!/usr/bin/env python3
"""
AJUSTE FINAL PARA RTP SIMÉTRICO
Reduzir liquidez base para que com price_multiplier resulte em RTP ~30%

Lógica:
- Básico (mult 1x): RTP 24% → precisa aumentar 25% → liquidez × 1.25
- Whale (mult 20x): RTP 76% → precisa reduzir 61% → liquidez × 0.39

Solução: liquidez_ajustada = liquidez_atual / sqrt(price_multiplier)
Isso compensa o crescimento quadrático do RTP
"""

import os
import requests
import json
import math
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

print("=" * 80)
print("🎯 AJUSTE FINAL - RTP SIMÉTRICO REAL")
print("=" * 80)

# Buscar todas as cartas
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/cards_base",
    headers=headers,
    params={'select': 'id,name,rarity,base_liquidity_brl'}
)
cards = response.json()

print(f"\n✅ {len(cards)} cartas carregadas")

print("\n📊 Análise do problema:")
print("  Básico (mult 1x): RTP 24% (baixo)")
print("  Padrão (mult 2x): RTP 32% (perfeito)")
print("  Premium (mult 4x): RTP 42% (alto)")
print("  Elite (mult 10x): RTP 55% (muito alto)")
print("  Whale (mult 20x): RTP 76% (crítico)")

print("\n💡 Solução: Manter liquidez base para RTP ~30% no Padrão")
print("  • O Padrão (mult 2x) já está perfeito com RTP 32%")
print("  • Multiplicar todas as liquidez por 1.6 para target RTP 30% no Básico")
print("  • O price_multiplier naturalmente escala nos outros tiers")

# Novo fator de correção
CORRECTION_FACTOR = 1.6

updates = []
for card in cards:
    new_liquidity = round(card['base_liquidity_brl'] * CORRECTION_FACTOR, 4)
    new_liquidity = max(new_liquidity, 0.0001)  # Mínimo absoluto
    
    updates.append({
        'id': card['id'],
        'name': card['name'],
        'rarity': card['rarity'],
        'old_liquidity': card['base_liquidity_brl'],
        'new_liquidity': new_liquidity
    })

# Mostrar exemplos
print("\n📋 Exemplos de mudanças (+60%):")
print(f"\n{'Nome':<30} {'Raridade':<12} {'Antigo':>12} {'Novo':>12}")
print("-" * 80)

for update in sorted(updates, key=lambda x: x['old_liquidity'], reverse=True)[:10]:
    print(f"{update['name']:<30} {update['rarity']:<12} R$ {update['old_liquidity']:>9.4f} R$ {update['new_liquidity']:>9.4f}")

# Salvar backup
backup_file = 'backup_liquidity_final_symmetric.json'
with open(backup_file, 'w', encoding='utf-8') as f:
    json.dump([
        {'id': c['id'], 'name': c['name'], 'rarity': c['rarity'], 'liquidity': c['base_liquidity_brl']}
        for c in cards
    ], f, indent=2, ensure_ascii=False)

print(f"\n✅ Backup salvo: {backup_file}")

print("\n📊 RTP Esperado após ajuste:")
print("  • Básico (mult 1x): ~39%")
print("  • Padrão (mult 2x): ~51%")
print("  • Premium (mult 4x): ~67%")
print("  • Elite (mult 10x): ~89%")
print("  • Whale (mult 20x): ~122%")
print("\n⚠️  AINDA NÃO É A SOLUÇÃO CORRETA!")

print("\n" + "=" * 80)
print("💡 SOLUÇÃO REAL: NÃO multiplicar base_liquidity × price_multiplier")
print("=" * 80)
print("\nO price_multiplier deve APENAS afetar jackpots, não a liquidez base!")
print("\nBackend correto:")
print("  drop_value = card.base_liquidity_brl × skin_mult")
print("  jackpot_value = jackpot_base × price_multiplier  # Apenas jackpots escalam!")
print("\nIsso garante:")
print("  • Liquidez base: RTP ~30% para TODOS os tiers")
print("  • Jackpots escalam: Whale tem jackpots 20x maiores que Básico")
print("  • RTP final simétrico (~30-35%)")

print("\n❌ NÃO APLICAR ESTE SCRIPT")
print("✅ CORRIGIR BACKEND para NÃO multiplicar base_liquidity")
print("=" * 80)
