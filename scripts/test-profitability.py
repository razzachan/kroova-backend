"""
Simulação de lucratividade: 1000 boosters abertos

Calcula:
- Total investido pelos players
- Total pago em prêmios (cartas + jackpots)
- Lucro da casa
- Margem de lucro por tier
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
import random

load_dotenv()

supabase: Client = create_client(
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)

# Carregar dados
boosters = supabase.table('booster_types').select('*').eq('edition_id', 'ED01').execute().data
cards = supabase.table('cards_base').select('*').eq('edition_id', 'ED01').execute().data
jackpots_data = supabase.table('raspadinhas').select('*').execute().data

# Organizar cartas por raridade
cards_by_rarity = {}
for card in cards:
    rarity = card['rarity']
    if rarity not in cards_by_rarity:
        cards_by_rarity[rarity] = []
    cards_by_rarity[rarity].append(card)

# Organizar jackpots por booster
jackpots_by_booster = {}
for jp in jackpots_data:
    bid = jp['booster_type_id']
    if bid not in jackpots_by_booster:
        jackpots_by_booster[bid] = []
    jackpots_by_booster[bid].append(jp)

def simulate_opening(booster):
    """Simula abertura de 1 booster"""
    price = float(booster['price_brl'])
    cards_per = booster['cards_per_booster']
    rarity_dist = booster['rarity_distribution']
    jackpots = jackpots_by_booster.get(booster['id'], [])
    
    total_payout = 0
    
    # Abrir cartas
    for _ in range(cards_per):
        # Sortear raridade
        roll = random.random() * 100
        cumulative = 0
        selected_rarity = 'trash'
        
        for rarity in ['trash', 'meme', 'viral', 'legendary', 'epica', 'godmode']:
            if rarity in rarity_dist:
                cumulative += float(rarity_dist[rarity])
                if roll <= cumulative:
                    selected_rarity = rarity
                    break
        
        # Sortear carta
        available = cards_by_rarity.get(selected_rarity, [])
        if available:
            card = random.choice(available)
            
            # Sortear skin
            skin_roll = random.random()
            if skin_roll < 0.05:
                skin_mult = 3.0
            elif skin_roll < 0.20:
                skin_mult = 1.5
            else:
                skin_mult = 1.0
            
            card_value = card['base_liquidity_brl'] * skin_mult
            total_payout += card_value
    
    # Sortear jackpot
    for jp in jackpots:
        if random.random() * 100 <= float(jp['probability']) * 100:
            jackpot_value = min(price * jp['multiplier'], 500.0)
            total_payout += jackpot_value
            break
    
    return total_payout

print("="*80)
print("💰 SIMULAÇÃO DE LUCRATIVIDADE - 1000 BOOSTERS")
print("="*80)

# Distribuição realista de vendas (maioria compra Básico)
sales_distribution = {
    'Básico': 600,   # 60% das vendas
    'Padrão': 250,   # 25%
    'Premium': 100,  # 10%
    'Elite': 40,     # 4%
    'Whale': 10      # 1%
}

results = []

for tier_name, quantity in sales_distribution.items():
    # Pegar boosters desse tier (3 packs: Alpha, Beta, Gamma)
    tier_boosters = [b for b in boosters if tier_name in b['name']]
    
    tier_revenue = 0
    tier_payout = 0
    
    for _ in range(quantity):
        # Escolher pack aleatório (33% cada)
        booster = random.choice(tier_boosters)
        price = float(booster['price_brl'])
        payout = simulate_opening(booster)
        
        tier_revenue += price
        tier_payout += payout
    
    tier_profit = tier_revenue - tier_payout
    tier_margin = (tier_profit / tier_revenue * 100) if tier_revenue > 0 else 0
    
    results.append({
        'tier': tier_name,
        'quantity': quantity,
        'revenue': tier_revenue,
        'payout': tier_payout,
        'profit': tier_profit,
        'margin': tier_margin
    })

print("\n📊 RESULTADOS POR TIER:")
print("-" * 80)
print(f"{'Tier':<10} {'Qtd':<6} {'Receita':>12} {'Premiação':>12} {'Lucro':>12} {'Margem':>8}")
print("-" * 80)

total_revenue = 0
total_payout = 0

for r in results:
    print(f"{r['tier']:<10} {r['quantity']:<6} R$ {r['revenue']:>9.2f} R$ {r['payout']:>9.2f} R$ {r['profit']:>9.2f} {r['margin']:>6.1f}%")
    total_revenue += r['revenue']
    total_payout += r['payout']

total_profit = total_revenue - total_payout
total_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0

print("-" * 80)
print(f"{'TOTAL':<10} {1000:<6} R$ {total_revenue:>9.2f} R$ {total_payout:>9.2f} R$ {total_profit:>9.2f} {total_margin:>6.1f}%")

print("\n" + "="*80)
print("💡 ANÁLISE DE VIABILIDADE")
print("="*80)

print(f"\n📈 Receita Total: R$ {total_revenue:.2f}")
print(f"💸 Premiação Total: R$ {total_payout:.2f}")
print(f"💰 Lucro Líquido: R$ {total_profit:.2f}")
print(f"📊 Margem de Lucro: {total_margin:.1f}%")

print("\n🎯 AVALIAÇÃO:")
if total_margin > 30:
    print("✅ EXCELENTE: Margem saudável, negócio muito lucrativo")
elif total_margin > 20:
    print("✅ BOM: Margem positiva, negócio sustentável")
elif total_margin > 10:
    print("⚠️ ACEITÁVEL: Margem baixa, aumentar volume de vendas")
else:
    print("❌ CRÍTICO: Margem muito baixa, ajustar RTP")

print("\n📊 PROJEÇÕES:")
print(f"  • 10.000 boosters/mês: R$ {total_profit * 10:.2f} lucro")
print(f"  • 100.000 boosters/mês: R$ {total_profit * 100:.2f} lucro")
print(f"  • 1.000.000 boosters/mês: R$ {total_profit * 1000:.2f} lucro")

print("\n" + "="*80)
