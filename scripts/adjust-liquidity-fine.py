#!/usr/bin/env python3
"""
AJUSTE FINO DE LIQUIDEZ
Objetivo: RTP entre 27-33% para todos os boosters
"""

import os
import requests
import json
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
print("🎯 AJUSTE FINO DE LIQUIDEZ - TARGET RTP 27-33%")
print("=" * 80)

# Análise do problema:
# - Básico: RTP 71% (muito alto, precisa reduzir 40%)
# - Whale: RTP 17% (baixo, precisa aumentar 60%)
# 
# Solução: Multiplicar liquidez base por fator de correção

# Buscar todas as cartas
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/cards_base",
    headers=headers,
    params={'select': 'id,name,rarity,base_liquidity_brl'}
)
cards = response.json()

print(f"\n✅ {len(cards)} cartas carregadas")
print("\n📊 Análise do problema:")
print("  • Básico (R$ 0.50): RTP 71% → Target 30% (reduzir 57%)")
print("  • Whale (R$ 10.00): RTP 17% → Target 30% (aumentar 76%)")
print("\n💡 Solução: Multiplicar todas as liquidez por 0.42")
print("  • Isso reduz RTP proporcionalmente em ~58%")

CORRECTION_FACTOR = 0.42

# Aplicar fator de correção
updates = []
for card in cards:
    new_liquidity = round(card['base_liquidity_brl'] * CORRECTION_FACTOR, 4)
    
    # Mínimo absoluto: R$ 0.0001
    new_liquidity = max(new_liquidity, 0.0001)
    
    updates.append({
        'id': card['id'],
        'name': card['name'],
        'rarity': card['rarity'],
        'old_liquidity': card['base_liquidity_brl'],
        'new_liquidity': new_liquidity
    })

# Mostrar exemplos
print("\n📋 Exemplos de mudanças:")
print(f"\n{'Nome':<30} {'Raridade':<12} {'Antigo':>12} {'Novo':>12} {'Variação':>12}")
print("-" * 90)

for update in sorted(updates, key=lambda x: x['old_liquidity'], reverse=True)[:15]:
    variation = ((update['new_liquidity'] / update['old_liquidity']) - 1) * 100
    print(f"{update['name']:<30} {update['rarity']:<12} R$ {update['old_liquidity']:>9.4f} R$ {update['new_liquidity']:>9.4f} {variation:>10.1f}%")

# Salvar backup
backup_file = 'backup_liquidity_ajuste_fino.json'
with open(backup_file, 'w', encoding='utf-8') as f:
    json.dump([
        {'id': c['id'], 'name': c['name'], 'rarity': c['rarity'], 'liquidity': c['base_liquidity_brl']}
        for c in cards
    ], f, indent=2, ensure_ascii=False)

print(f"\n✅ Backup salvo: {backup_file}")

# Perguntar confirmação
print("\n" + "=" * 80)
choice = input("⚠️  APLICAR mudanças? (digite 'SIM' para confirmar): ")

if choice == 'SIM':
    print("\n🔄 Aplicando mudanças...")
    
    success_count = 0
    for update in updates:
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/cards_base",
            headers=headers,
            params={'id': f"eq.{update['id']}"},
            json={'base_liquidity_brl': update['new_liquidity']}
        )
        
        if response.status_code in [200, 201, 204]:
            success_count += 1
            if success_count % 50 == 0:
                print(f"  ... {success_count}/{len(updates)}")
        else:
            print(f"❌ Erro em {update['name']}: {response.status_code}")
    
    print(f"\n✅ {success_count}/{len(updates)} cartas atualizadas!")
    print("\n🔄 Execute agora: python scripts\\test-real-rtp.py")
    print("\n📊 RTP esperado:")
    print("  • Básico: ~30%")
    print("  • Padrão: ~20%")
    print("  • Premium: ~15%")
    print("  • Elite: ~9%")
    print("  • Whale: ~7%")
else:
    print("\n❌ Operação cancelada")

print("\n" + "=" * 80)
