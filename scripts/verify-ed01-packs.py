#!/usr/bin/env python3
"""Verificar sistema de packs Alpha/Beta/Gamma e RTP"""

import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def get_ed01_packs():
    url = f"{SUPABASE_URL}/rest/v1/booster_types"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    params = {
        'select': '*',
        'edition_id': 'eq.ED01',
        'order': 'price_brl.asc'
    }
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

def get_edition_config():
    url = f"{SUPABASE_URL}/rest/v1/edition_configs"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    params = {'select': '*', 'id': 'eq.ED01'}
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    data = response.json()
    return data[0] if data else None

def main():
    print("=" * 80)
    print("🎴 SISTEMA DE PACKS ED01 - ALPHA/BETA/GAMMA")
    print("=" * 80)
    
    packs = get_ed01_packs()
    edition = get_edition_config()
    
    if not packs:
        print("\n❌ Nenhum pack ED01 encontrado!")
        return
    
    print(f"\n📦 PACKS ATIVOS ({len(packs)}):\n")
    for p in packs:
        pack_id = p.get('pack_id', 'N/A')
        name = p.get('pack_name', p.get('name', 'N/A'))
        price = p.get('price_brl', 0)
        mult = p.get('price_multiplier', 1.0)
        dist = p.get('rarity_distribution', {})
        godmode = dist.get('godmode', 0)
        legendary = dist.get('legendary', 0)
        
        print(f"   {pack_id:15s} | {name:25s}")
        print(f"      Preço: R$ {price:6.2f} | Multiplicador: {mult:.1f}x")
        print(f"      Godmode: {godmode}% | Legendary: {legendary}%")
        print()
    
    # Edition config
    if edition:
        print("\n⚙️  EDITION CONFIG (ED01):")
        print(f"   RTP Target: {edition.get('rtp_target', 'N/A')}")
        print(f"   Jackpot Hard Cap: R$ {edition.get('jackpot_hard_cap', 'N/A')}")
        print(f"   Godmode Multiplier: {edition.get('godmode_multiplier', 'N/A')}x")
        
        base_liq = edition.get('base_liquidity', {})
        print(f"\n   💰 Base Liquidity:")
        for rarity, val in sorted(base_liq.items(), key=lambda x: x[1]):
            print(f"      {rarity:10s}: R$ {val:.2f}")
        
        skin_mult = edition.get('skin_multipliers', {})
        print(f"\n   ✨ Skin Multipliers:")
        for skin, mult in sorted(skin_mult.items(), key=lambda x: x[1]):
            print(f"      {skin:10s}: {mult:.1f}x")
    
    # Calcular RTP teórico
    print("\n" + "=" * 80)
    print("📊 CÁLCULO DE RTP POR PACK:")
    print("=" * 80)
    
    for p in packs:
        pack_id = p.get('pack_id', 'N/A')
        price = p.get('price_brl', 0)
        mult = p.get('price_multiplier', 1.0)
        
        if not edition:
            continue
        
        # Payout máximo teórico (godmode + max skin + multiplier)
        max_base_liq = max(edition.get('base_liquidity', {}).values())
        max_skin_mult = max(edition.get('skin_multipliers', {}).values())
        godmode_mult = edition.get('godmode_multiplier', 10)
        
        max_payout = max_base_liq * max_skin_mult * mult * godmode_mult
        jackpot_cap = edition.get('jackpot_hard_cap', 500)
        max_payout_capped = min(max_payout, jackpot_cap)
        
        multiplier_vs_price = max_payout_capped / price if price > 0 else 0
        
        print(f"\n   {pack_id}:")
        print(f"      Preço: R$ {price:.2f}")
        print(f"      Max Payout (teórico): R$ {max_payout:.2f}")
        print(f"      Max Payout (capped): R$ {max_payout_capped:.2f}")
        print(f"      Multiplicador vs preço: {multiplier_vs_price:.1f}x")
    
    print("\n" + "=" * 80)

if __name__ == '__main__':
    main()
