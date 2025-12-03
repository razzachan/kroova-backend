#!/usr/bin/env python3
"""Buscar packs Alpha/Beta/Gamma"""

import os
from dotenv import load_dotenv
import requests

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

url = f"{SUPABASE_URL}/rest/v1/booster_types"
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

# Buscar todos (apenas colunas que existem com certeza)
response = requests.get(url, headers=headers, params={'select': 'id,name,edition_id,price_brl,rarity_distribution,cards_per_booster'})
response.raise_for_status()
all_boosters = response.json()

print("\n" + "=" * 80)
print("🔍 TODOS OS BOOSTERS NO BANCO:")
print("=" * 80)

if isinstance(all_boosters, list):
    for b in all_boosters:
        name = b.get('name', 'N/A')
        edition = b.get('edition_id', 'N/A')
        price = b.get('price_brl', 0)
        cards = b.get('cards_per_booster', 5)
        dist = b.get('rarity_distribution', {})
        godmode = dist.get('godmode', 0) if dist else 0
        print(f"{name:30s} | {edition:6s} | R$ {price:7.2f} | {cards} cards | godmode:{godmode}%")
else:
    print(f"ERROR: Expected list, got {type(all_boosters)}")
    print(all_boosters)

# Buscar especificamente por nome contendo Alpha/Beta/Gamma
print("\n" + "=" * 80)
print("🎯 BUSCANDO PACKS ALPHA/BETA/GAMMA (por nome):")
print("=" * 80)

for search_name in ['Alpha', 'Beta', 'Gamma', 'ALPHA', 'BETA', 'GAMMA']:
    response = requests.get(url, headers=headers, params={'select': '*', 'name': f'ilike.*{search_name}*'})
    data = response.json()
    if data:
        print(f"\n✅ '{search_name}' ENCONTRADO ({len(data)} resultados):")
        for item in data:
            print(f"   Name: {item.get('name')}")
            print(f"   Price: R$ {item.get('price_brl')}")
            print(f"   Edition: {item.get('edition_id')}")
            print(f"   Godmode: {item.get('rarity_distribution', {}).get('godmode', 0)}%")
    else:
        print(f"\n❌ '{search_name}' NÃO ENCONTRADO")
