#!/usr/bin/env python3
"""
TESTE FINAL DE RTP SIMÉTRICO
Simula com price_multiplier aplicado
"""

import os
import requests
import random
from dotenv import load_dotenv
from collections import defaultdict

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json'
}

print("=" * 80)
print("🎰 TESTE FINAL DE RTP SIMÉTRICO - COM PRICE_MULTIPLIER")
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

def simulate_opening_with_multiplier(booster, num_simulations=10000):
    """Simula abertura de booster COM price_multiplier aplicado"""
    booster_name = booster['name']
    price = float(booster['price_brl'])
    price_multiplier = float(booster['price_multiplier'])
    cards_per_booster = booster['cards_per_booster']
    rarity_dist = booster['rarity_distribution']
    
    total_spent = price * num_simulations
    total_payout = 0
    godmode_count = 0
    
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
            
            if selected_rarity == 'godmode':
                godmode_count += 1
            
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
                
                # APLICAR PRICE_MULTIPLIER (NOVO)
                card_value = card['base_liquidity_brl'] * skin_mult * price_multiplier
                opening_value += card_value
        
        total_payout += opening_value
    
    rtp = (total_payout / total_spent) * 100
    avg_payout = total_payout / num_simulations
    
    return {
        'booster_name': booster_name,
        'price': price,
        'price_multiplier': price_multiplier,
        'simulations': num_simulations,
        'total_spent': total_spent,
        'total_payout': total_payout,
        'avg_payout': avg_payout,
        'rtp': rtp,
        'godmode_count': godmode_count
    }

# Testar cada booster
print("\n" + "=" * 80)
print("🎲 SIMULANDO 10.000 ABERTURAS POR BOOSTER (COM PRICE_MULTIPLIER)")
print("=" * 80)

results = []
for booster in boosters:
    result = simulate_opening_with_multiplier(booster, num_simulations=10000)
    results.append(result)

# Relatório final
print(f"\n{'Booster':<20} {'Price':>8} {'Mult':>6} {'Avg Payout':>12} {'RTP':>8} {'Godmode':>10}")
print("-" * 90)

for result in results:
    print(f"{result['booster_name']:<20} R${result['price']:>6.2f} {result['price_multiplier']:>5.0f}x R${result['avg_payout']:>10.4f} {result['rtp']:>6.2f}% {result['godmode_count']:>9}")

# Verificar se RTP está simétrico (27-33%)
print("\n" + "=" * 80)
print("✅ VALIDAÇÃO DE RTP SIMÉTRICO")
print("=" * 80)

rtps = [r['rtp'] for r in results]
avg_rtp = sum(rtps) / len(rtps)
min_rtp = min(rtps)
max_rtp = max(rtps)
rtp_variation = max_rtp - min_rtp

print(f"\nRTP Médio: {avg_rtp:.2f}%")
print(f"RTP Mínimo: {min_rtp:.2f}%")
print(f"RTP Máximo: {max_rtp:.2f}%")
print(f"Variação: {rtp_variation:.2f}%")

if rtp_variation < 5:
    print("\n✅ PERFEITO! RTP simétrico (<5% variação)")
elif rtp_variation < 10:
    print("\n✅ BOM! RTP quase simétrico (<10% variação)")
else:
    print(f"\n⚠️ ATENÇÃO: Variação de {rtp_variation:.2f}% é alta")

print("\n📊 Validação individual:")
for result in results:
    if 27 <= result['rtp'] <= 33:
        status = "✅ PERFEITO"
    elif 25 <= result['rtp'] <= 35:
        status = "✅ BOM"
    elif 20 <= result['rtp'] < 27:
        status = "⚠️ BAIXO"
    elif 33 < result['rtp'] <= 40:
        status = "⚠️ ALTO"
    else:
        status = "❌ CRÍTICO"
    
    print(f"{result['booster_name']:<20} {result['rtp']:>6.2f}% {status}")

print("\n" + "=" * 80)
