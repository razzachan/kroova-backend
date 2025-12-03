#!/usr/bin/env python3
"""Teste de RTP REAL com simulações configuráveis"""

import os
import requests
import random
from dotenv import load_dotenv
from collections import defaultdict

load_dotenv()

# Determine simulation count from env or default
sim_count_env = os.getenv("SIM_COUNT")
try:
    DEFAULT_SIM_COUNT = int(sim_count_env) if sim_count_env else 200
except ValueError:
    DEFAULT_SIM_COUNT = 200

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json'
}

print("=" * 80)
print(f"🎰 TESTE DE RTP REAL - {DEFAULT_SIM_COUNT} ABERTURAS")
print("=" * 80)

# Buscar todos os boosters
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={'select': '*', 'edition_id': 'eq.ED01', 'order': 'price_brl.asc'}
)
boosters = response.json()

# Buscar todas as cartas
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/cards_base",
    headers=headers,
    params={'select': 'id,name,rarity,base_liquidity_brl'}
)
cards = response.json()

# Indexar cartas por raridade
cards_by_rarity = defaultdict(list)
for card in cards:
    cards_by_rarity[card['rarity']].append(card)

print(f"\n✅ {len(boosters)} boosters carregados")
print(f"✅ {len(cards)} cartas carregadas")

# Buscar jackpots
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/raspadinhas",
    headers=headers,
    params={'select': '*'}
)
all_jackpots = response.json()

# Indexar jackpots por booster_type_id
jackpots_by_booster = defaultdict(list)
for jp in all_jackpots:
    jackpots_by_booster[jp['booster_type_id']].append(jp)

print(f"✅ {len(all_jackpots)} jackpots carregados")

def simulate_opening(booster, num_simulations=200):
    """Simula abertura de booster"""
    booster_id = booster['id']
    booster_name = booster['name']
    price = float(booster['price_brl'])
    price_multiplier = float(booster.get('price_multiplier', 1))
    cards_per_booster = booster['cards_per_booster']
    rarity_dist = booster['rarity_distribution']
    jackpots = jackpots_by_booster.get(booster_id, [])
    
    total_spent = price * num_simulations
    total_payout = 0
    godmode_count = 0
    legendary_count = 0
    jackpot_count = {'grand': 0, 'major': 0, 'minor': 0}
    
    for _ in range(num_simulations):
        opening_value = 0
        
        # Sortear 5 cartas
        for _ in range(cards_per_booster):
            # Sortear raridade
            roll = random.random() * 100
            cumulative = 0
            selected_rarity = 'trash'
            
            for rarity in ['godmode', 'epica', 'legendary', 'viral', 'meme', 'trash']:
                if rarity in rarity_dist:
                    cumulative += float(rarity_dist[rarity])
                    if roll <= cumulative:
                        selected_rarity = rarity
                        break
            
            # Contar godmode/legendary
            if selected_rarity == 'godmode':
                godmode_count += 1
            elif selected_rarity == 'legendary':
                legendary_count += 1
            
            # Sortear carta dessa raridade
            available_cards = cards_by_rarity.get(selected_rarity, [])
            if available_cards:
                card = random.choice(available_cards)
                
                # Sortear skin (80% default 1x, 15% premium 1.5x, 5% ghost 3x)
                skin_roll = random.random()
                if skin_roll < 0.05:
                    skin_mult = 3.0
                elif skin_roll < 0.20:
                    skin_mult = 1.5
                else:
                    skin_mult = 1.0
                
                # SEM price_multiplier - RTP 70% fixo para todos os tiers
                card_value = card['base_liquidity_brl'] * skin_mult
                opening_value += card_value
        
        # Sortear jackpot
        for jp in jackpots:
            if random.random() * 100 <= float(jp['probability']) * 100:
                jackpot_value = min(price * jp['multiplier'], 500.0)  # Hard cap R$500
                opening_value += jackpot_value
                jackpot_count[jp['tier']] += 1
                break
        
        total_payout += opening_value
    
    rtp = (total_payout / total_spent) * 100
    avg_payout = total_payout / num_simulations
    
    return {
        'booster_name': booster_name,
        'price': price,
        'simulations': num_simulations,
        'total_spent': total_spent,
        'total_payout': total_payout,
        'avg_payout': avg_payout,
        'rtp': rtp,
        'godmode_count': godmode_count,
        'legendary_count': legendary_count,
        'jackpot_count': jackpot_count
    }

# Testar cada booster
print("\n" + "=" * 80)
print(f"🎲 SIMULANDO {DEFAULT_SIM_COUNT} ABERTURAS POR BOOSTER")
print("=" * 80)

results = []
for booster in boosters:
    print(f"\n🔄 Testando {booster['name']}...")
    result = simulate_opening(booster, num_simulations=DEFAULT_SIM_COUNT)
    results.append(result)
    
    print(f"  Price: R$ {result['price']:.2f}")
    print(f"  Avg Payout: R$ {result['avg_payout']:.4f}")
    print(f"  RTP: {result['rtp']:.2f}%")
    print(f"  Godmode: {result['godmode_count']}/{DEFAULT_SIM_COUNT} ({result['godmode_count']*100/DEFAULT_SIM_COUNT:.2f}%)")
    print(f"  Legendary: {result['legendary_count']}/{DEFAULT_SIM_COUNT} ({result['legendary_count']*100/DEFAULT_SIM_COUNT:.2f}%)")
    print(f"  Jackpots: Grand={result['jackpot_count']['grand']}, Major={result['jackpot_count']['major']}, Minor={result['jackpot_count']['minor']}")

# Relatório final
print("\n" + "=" * 80)
print("📊 RELATÓRIO FINAL DE RTP")
print("=" * 80)

print(f"\n{'Booster':<20} {'Price':>8} {'Avg Payout':>12} {'RTP':>8} {'Godmode':>10}")
print("-" * 80)

for result in results:
    print(f"{result['booster_name']:<20} R${result['price']:>6.2f} R${result['avg_payout']:>10.4f} {result['rtp']:>6.2f}% {result['godmode_count']:>9}")

# Verificar se RTP está no range saudável (27-33%)
print("\n" + "=" * 80)
print("✅ VALIDAÇÃO DE RTP")
print("=" * 80)

for result in results:
    if 27 <= result['rtp'] <= 33:
        status = "✅ SAUDÁVEL"
    elif 20 <= result['rtp'] < 27:
        status = "⚠️ BAIXO"
    elif 33 < result['rtp'] <= 40:
        status = "⚠️ ALTO"
    else:
        status = "❌ CRÍTICO"
    
    print(f"{result['booster_name']:<20} {result['rtp']:>6.2f}% {status}")

print("\n" + "=" * 80)
