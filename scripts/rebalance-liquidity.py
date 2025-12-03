#!/usr/bin/env python3
"""
REBALANCEAR LIQUIDEZ DAS CARTAS
Ajustar para valores realistas que resultam em RTP 27-33%
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
print("💰 REBALANCEANDO LIQUIDEZ DAS CARTAS")
print("=" * 80)

# Buscar todas as cartas
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/cards_base",
    headers=headers,
    params={'select': 'id,name,rarity,base_liquidity_brl'}
)
cards = response.json()
print(f"\n✅ {len(cards)} cartas carregadas")

# Novos ranges de liquidez (MUITO MAIS BAIXOS)
NEW_LIQUIDITY_RANGES = {
    'trash': (0.001, 0.01),      # R$ 0.001 - R$ 0.01
    'meme': (0.01, 0.05),         # R$ 0.01 - R$ 0.05
    'viral': (0.05, 0.20),        # R$ 0.05 - R$ 0.20
    'legendary': (0.20, 1.00),    # R$ 0.20 - R$ 1.00
    'godmode': (1.00, 5.00)       # R$ 1.00 - R$ 5.00
}

print("\n📊 Novos ranges de liquidez:")
for rarity, (min_val, max_val) in NEW_LIQUIDITY_RANGES.items():
    print(f"  {rarity.upper()}: R$ {min_val:.3f} - R$ {max_val:.3f}")

print("\n⚠️  ATENÇÃO: Isso vai reduzir drasticamente a liquidez!")
print("  • RTP esperado cairá de 7000% para ~30%")
print("  • Cartas que valiam R$ 2500 passarão a valer R$ 5")
print("  • Necessário para viabilidade econômica do projeto")

# Calcular nova liquidez para cada carta
updates = []
for card in cards:
    rarity = card['rarity']
    min_liq, max_liq = NEW_LIQUIDITY_RANGES.get(rarity, (0.001, 0.01))
    
    # Distribuir uniformemente no range
    import hashlib
    card_hash = int(hashlib.md5(card['id'].encode()).hexdigest()[:8], 16)
    normalized = (card_hash % 1000) / 1000.0  # 0.0 - 1.0
    
    new_liquidity = min_liq + (normalized * (max_liq - min_liq))
    new_liquidity = round(new_liquidity, 4)
    
    updates.append({
        'id': card['id'],
        'name': card['name'],
        'rarity': rarity,
        'old_liquidity': card['base_liquidity_brl'],
        'new_liquidity': new_liquidity
    })

# Mostrar exemplos
print("\n📋 Exemplos de mudanças:")
print(f"\n{'Nome':<30} {'Raridade':<12} {'Antigo':>12} {'Novo':>12}")
print("-" * 80)

for update in sorted(updates, key=lambda x: x['old_liquidity'], reverse=True)[:10]:
    print(f"{update['name']:<30} {update['rarity']:<12} R$ {update['old_liquidity']:>9.4f} R$ {update['new_liquidity']:>9.4f}")

# Salvar backup
backup_file = 'backup_liquidity_antes_rebalance.json'
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
        else:
            print(f"❌ Erro em {update['name']}: {response.text}")
    
    print(f"\n✅ {success_count}/{len(updates)} cartas atualizadas!")
    print("\n🔄 Execute agora: python scripts\\test-real-rtp.py")
else:
    print("\n❌ Operação cancelada")

print("\n" + "=" * 80)
