#!/usr/bin/env python3
"""Verificar liquidez e calcular RTP"""

import os
from dotenv import load_dotenv
import requests

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def get_all_cards():
    url = f"{SUPABASE_URL}/rest/v1/cards_base"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    params = {
        'select': 'rarity,base_liquidity_brl',
        'edition_id': 'eq.ED01'
    }
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

def main():
    print("=" * 70)
    print("💰 VERIFICAÇÃO DE LIQUIDEZ E RTP")
    print("=" * 70)
    
    cards = get_all_cards()
    
    # Agrupar por raridade
    by_rarity = {}
    for card in cards:
        rarity = card['rarity']
        liq = card['base_liquidity_brl']
        if rarity not in by_rarity:
            by_rarity[rarity] = []
        by_rarity[rarity].append(liq)
    
    # Valores esperados
    expected = {
        'trash': 0.01,
        'meme': 0.03,
        'viral': 0.10,
        'legendary': 0.50,
        'godmode': 1.00
    }
    
    print("\n💰 LIQUIDEZ POR RARIDADE:")
    all_correct = True
    for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
        vals = by_rarity.get(rarity, [])
        if vals:
            min_val = min(vals)
            max_val = max(vals)
            exp = expected[rarity]
            status = "✅" if min_val == max_val == exp else "❌"
            if status == "❌":
                all_correct = False
            print(f"   {rarity:10s} → R$ {min_val:.2f} (esperado: R$ {exp:.2f}) {status}")
    
    if all_correct:
        print("\n✅ Todas liquidez CORRETAS - economia intacta!")
    else:
        print("\n⚠️  ATENÇÃO: Liquidez diverge do esperado!")
    
    # Calcular RTP
    print("\n📊 CÁLCULO DE RTP:")
    avg_liquidity = sum(c['base_liquidity_brl'] for c in cards) / len(cards)
    booster_value = avg_liquidity * 5  # 5 cartas por booster
    booster_cost = 2.50
    rtp = (booster_value / booster_cost) * 100
    
    print(f"   Liquidez média: R$ {avg_liquidity:.4f}")
    print(f"   Valor médio booster: R$ {booster_value:.2f} (5 cartas)")
    print(f"   Custo booster: R$ {booster_cost:.2f}")
    print(f"   RTP: {rtp:.1f}%")
    
    if 27 <= rtp <= 30:
        print("   ✅ RTP dentro do range esperado (27-30%)")
    else:
        print(f"   ⚠️  RTP fora do range (esperado: 27-30%)")
    
    print("\n" + "=" * 70)

if __name__ == '__main__':
    main()
