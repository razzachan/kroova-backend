#!/usr/bin/env python3
"""Verificar boosters cadastrados e sistema de pity"""

import os
from dotenv import load_dotenv
import requests

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def get_boosters():
    url = f"{SUPABASE_URL}/rest/v1/booster_types"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    params = {'select': '*', 'order': 'price_brl.asc'}
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

def main():
    print("=" * 70)
    print("📦 VERIFICAÇÃO DE BOOSTERS E SISTEMA DE PITY")
    print("=" * 70)
    
    boosters = get_boosters()
    
    print(f"\n📦 BOOSTERS CADASTRADOS ({len(boosters)}):\n")
    for b in sorted(boosters, key=lambda x: x.get('price_brl', 0)):
        pack_id = b.get('pack_id', b.get('id', 'N/A'))
        name = b.get('pack_name', b.get('name', 'N/A'))
        price = b.get('price_brl', 0)
        cards = b.get('cards_per_booster', 5)
        print(f"   {pack_id:15s} | {name:30s} | R$ {price:6.2f} | {cards} cartas")
    
    # Verificar se há tiers/bundles
    unique_prices = sorted(set(b.get('price_brl', 0) for b in boosters))
    print(f"\n💰 PREÇOS ÚNICOS: {unique_prices}")
    
    if len(unique_prices) > 1:
        print("   ✅ Múltiplos tiers detectados!")
    else:
        print("   ⚠️  Apenas 1 tier de preço")
    
    # Verificar distribuições
    print("\n🎲 DISTRIBUIÇÕES DE RARIDADE:")
    for b in boosters:
        pack_id = b.get('pack_id', b.get('id'))
        dist = b.get('rarity_distribution', {})
        if dist:
            godmode = dist.get('godmode', 0)
            legendary = dist.get('legendary', 0)
            print(f"   {pack_id}: godmode={godmode}% | legendary={legendary}%")
    
    print("\n" + "=" * 70)

if __name__ == '__main__':
    main()
