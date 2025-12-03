"""Verificar scores únicos no arquivo de updates"""
import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

with open('scripts/score_updates.json', 'r', encoding='utf-8') as f:
    updates = json.load(f)

# Criar mapa id -> rarity
response = requests.get(
    f"{os.getenv('NEXT_PUBLIC_SUPABASE_URL')}/rest/v1/cards_base",
    headers={
        'apikey': os.getenv('SUPABASE_SERVICE_ROLE_KEY'),
        'Authorization': f'Bearer {os.getenv("SUPABASE_SERVICE_ROLE_KEY")}'
    },
    params={'select': 'id,rarity', 'edition_id': 'eq.ED01', 'limit': '1000'}
)

id_to_rarity = {}
for card in response.json():
    id_to_rarity[card['id']] = card['rarity']

# Contar scores únicos por raridade
by_rarity = {}
for update in updates:
    rarity = id_to_rarity.get(update['id'])
    if rarity:
        if rarity not in by_rarity:
            by_rarity[rarity] = []
        by_rarity[rarity].append(update['new_rarity'])

print("📊 SCORES ÚNICOS NOS UPDATES:")
for rarity in ['trash', 'meme', 'viral', 'legendary']:
    if rarity in by_rarity:
        scores = by_rarity[rarity]
        unique = len(set(scores))
        total = len(scores)
        print(f"   {rarity.upper():12} | {unique:3d}/{total:3d} únicos ({unique/total*100:5.1f}%)")
        
        # Mostrar alguns exemplos
        unique_scores = sorted(set(scores))
        print(f"      Exemplo scores: {unique_scores[:10]}")
