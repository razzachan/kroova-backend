"""Calcular RTP real incluindo sistema de jackpots 500x"""
import os
import requests
import random
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

# Buscar configurações
config_response = requests.get(
    f"{SUPABASE_URL}/rest/v1/edition_configs",
    headers=headers,
    params={'id': 'eq.ED01', 'select': '*'}
)

boosters_response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={'edition_id': 'eq.ED01', 'select': '*'}
)

jackpots_response = requests.get(
    f"{SUPABASE_URL}/rest/v1/raspadinhas",
    headers=headers,
    params={'select': '*'}
)

config = config_response.json()[0]
boosters = boosters_response.json()

# Organizar jackpots por booster_type_id
jackpots_data = jackpots_response.json()
jackpots = {}
if isinstance(jackpots_data, list):
    for j in jackpots_data:
        booster_id = j.get('booster_type_id')
        if booster_id:
            if booster_id not in jackpots:
                jackpots[booster_id] = []
            jackpots[booster_id].append(j)

# Skin multipliers
SKIN_MULTIPLIERS = {'default': 1.0, 'neon': 1.2, 'glow': 1.5, 'glitch': 2.0, 
                   'ghost': 3.0, 'holo': 3.0, 'dark': 3.0}

def simulate_booster_opening(booster, num_simulations=10000):
    """Simula aberturas de booster e calcula RTP"""
    
    rarity_dist = booster['rarity_distribution']
    cards_per_pack = booster.get('cards_per_booster', 5)
    price = booster['price_brl']
    booster_jackpots = jackpots.get(booster['id'], [])
    
    total_payout = 0
    jackpot_hits = {'grand': 0, 'major': 0, 'minor': 0}
    
    for _ in range(num_simulations):
        pack_value = 0
        
        # Dropar 5 cartas
        for _ in range(cards_per_pack):
            # Sortear raridade
            roll = random.random() * 100
            cumulative = 0
            rarity = 'trash'
            
            for r in ['godmode', 'epica', 'legendary', 'viral', 'meme', 'trash']:
                if r in rarity_dist:
                    cumulative += rarity_dist[r]
                    if roll <= cumulative:
                        rarity = r
                        break
            
            # Liquidez base por raridade
            base_liquidity = {
                'trash': 0.01,
                'meme': 0.03,
                'viral': 0.10,
                'legendary': 0.50,
                'epica': 1.00,
                'godmode': 1.00
            }.get(rarity, 0.01)
            
            # Sortear skin aleatória (80% default, 20% outras)
            skin_roll = random.random()
            if skin_roll > 0.8:
                skin = random.choice(['neon', 'glow', 'glitch', 'ghost', 'holo', 'dark'])
            else:
                skin = 'default'
            
            skin_mult = SKIN_MULTIPLIERS[skin]
            
            card_value = base_liquidity * skin_mult
            pack_value += card_value
        
        # Sortear jackpot
        jackpot_value = 0
        for jp in booster_jackpots:
            if random.random() * 100 <= jp['probability']:
                jackpot_value = price * jp['multiplier']
                jackpot_value = min(jackpot_value, config['jackpot_hard_cap'])
                jackpot_hits[jp['tier']] += 1
                break  # Apenas 1 jackpot por pack
        
        total_payout += pack_value + jackpot_value
    
    avg_payout = total_payout / num_simulations
    rtp = (avg_payout / price) * 100
    
    return {
        'avg_payout': avg_payout,
        'rtp': rtp,
        'jackpot_hits': jackpot_hits,
        'jackpot_rate': sum(jackpot_hits.values()) / num_simulations * 100
    }

print("="*80)
print("🎰 CÁLCULO DE RTP COM SISTEMA DE JACKPOTS")
print("="*80)

# Simular cada tier
tiers = ['Básico', 'Padrão', 'Premium', 'Elite', 'Whale']
prices = [0.50, 1.00, 2.00, 5.00, 10.00]

results_by_pack = {}

for pack_id in ['ED01_ALPHA', 'ED01_BETA', 'ED01_GAMMA']:
    pack_boosters = [b for b in boosters if b.get('pack_id') == pack_id]
    pack_boosters.sort(key=lambda x: x['price_brl'])
    
    print(f"\n📦 {pack_id.replace('ED01_', '').upper()}")
    print("-"*80)
    
    results_by_pack[pack_id] = []
    
    for i, booster in enumerate(pack_boosters):
        tier_name = tiers[i] if i < len(tiers) else f"Tier {i+1}"
        
        result = simulate_booster_opening(booster, num_simulations=5000)
        results_by_pack[pack_id].append(result)
        
        print(f"\n🎴 {tier_name} (R${booster['price_brl']:.2f})")
        print(f"   Godmode: {booster['rarity_distribution'].get('godmode', 0):.1f}%")
        print(f"   Payout médio: R${result['avg_payout']:.4f}")
        print(f"   RTP: {result['rtp']:.2f}%")
        print(f"   Jackpots: {result['jackpot_rate']:.3f}% (Grand: {result['jackpot_hits']['grand']}, Major: {result['jackpot_hits']['major']}, Minor: {result['jackpot_hits']['minor']})")

# Resumo global
print("\n" + "="*80)
print("📊 RESUMO GLOBAL")
print("="*80)

all_rtps = []
for pack_results in results_by_pack.values():
    all_rtps.extend([r['rtp'] for r in pack_results])

avg_rtp = sum(all_rtps) / len(all_rtps)
min_rtp = min(all_rtps)
max_rtp = max(all_rtps)

print(f"\n💰 RTP Médio: {avg_rtp:.2f}%")
print(f"   Mínimo: {min_rtp:.2f}%")
print(f"   Máximo: {max_rtp:.2f}%")

if 27 <= avg_rtp <= 33:
    print("\n✅ RTP SAUDÁVEL (27-33% ideal para jogos de card)")
elif avg_rtp < 27:
    print("\n⚠️  RTP BAIXO - Considerar:")
    print("   - Aumentar probabilidade de jackpots minor (0.5% → 1%)")
    print("   - Aumentar godmode em tiers baixos (0.3% → 0.5%)")
elif avg_rtp > 33:
    print("\n⚠️  RTP ALTO - Considerar:")
    print("   - Reduzir jackpots grand (500x → 400x em Básico)")
    print("   - Reduzir godmode em Whale (1.0% → 0.8%)")

print("\n" + "="*80)
