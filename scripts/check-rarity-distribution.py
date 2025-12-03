import os
from dotenv import load_dotenv
import requests

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def check_rarity_distribution():
    """Verifica distribuição de raridade e liquidez"""
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
    cards = response.json()
    
    # Contar por raridade
    rarity_count = {}
    liquidity_check = {}
    
    for card in cards:
        rarity = card['rarity']
        liquidity = card['base_liquidity_brl']
        
        rarity_count[rarity] = rarity_count.get(rarity, 0) + 1
        
        if rarity not in liquidity_check:
            liquidity_check[rarity] = set()
        liquidity_check[rarity].add(liquidity)
    
    print("📊 DISTRIBUIÇÃO DE RARIDADE:")
    print("=" * 50)
    total = len(cards)
    for rarity, count in sorted(rarity_count.items(), key=lambda x: x[1], reverse=True):
        pct = (count / total) * 100
        print(f"{rarity:12} | {count:3} cartas | {pct:5.1f}%")
    
    print("\n💰 LIQUIDEZ POR RARIDADE:")
    print("=" * 50)
    expected = {
        'trash': 0.01,
        'meme': 0.03,
        'viral': 0.10,
        'legendary': 0.50,
        'godmode': 1.00
    }
    
    for rarity, liquidities in sorted(liquidity_check.items()):
        expected_value = expected.get(rarity, '???')
        actual_values = sorted(liquidities)
        
        if len(actual_values) == 1 and actual_values[0] == expected_value:
            status = "✅"
        else:
            status = "⚠️"
        
        print(f"{status} {rarity:12} | Esperado: R${expected_value} | Real: {actual_values}")

if __name__ == '__main__':
    check_rarity_distribution()
