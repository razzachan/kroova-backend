#!/usr/bin/env python3
"""
Script de simulação de abertura de boosters Kroova
Testa RTP (Return to Player), distribuição de raridades, godmode, e lucratividade
"""

import os
import json
import random
from collections import Counter, defaultdict
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Configuração
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

supabase: Client | None = None
def looks_like_url(u: str | None) -> bool:
    return isinstance(u, str) and (u.startswith('http://') or u.startswith('https://'))

def looks_like_key(k: str | None) -> bool:
    return isinstance(k, str) and len(k) > 20

if looks_like_url(SUPABASE_URL) and looks_like_key(SUPABASE_KEY):
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None
    # print("⚠️ Rodando em modo offline: usando configs locais")

# Sistema de 3 camadas: RARITY × SKIN × GODMODE × PRICE
SKIN_WEIGHTS = {
    'default': 50.0,
    'neon': 25.0,
    'glow': 15.0,
    'glitch': 7.0,
    'ghost': 2.0,
    'holo': 0.8,
    'dark': 0.2
}

# Caps de multiplicador por skin (para evitar outliers sem godmode)
SKIN_MULTIPLIER_CAPS = {
    'default': 1.0,
    'neon': 1.2,
    'glow': 1.5,
    'glitch': 2.0,
    'ghost': 3.0,
    'holo': 3.0,
    'dark': 3.0,
}

# Default jackpot tiers (aligned with apply-jackpot-tiers.js) used for simulation
# when DB column is missing. Format: per booster name list of {name, probability, multiplier}
DEFAULT_JACKPOT_TIERS = {
    'Booster Micro': [
        { 'name': 'grand', 'probability': 0.00001, 'multiplier': 500 },  # EV ≈ 0.005
        { 'name': 'major', 'probability': 0.00020, 'multiplier': 100 },  # EV ≈ 0.020
        { 'name': 'minor', 'probability': 0.00500, 'multiplier': 10 },   # EV ≈ 0.050
    ],
    'Booster Básico': [
        { 'name': 'grand', 'probability': 0.00002, 'multiplier': 500 },  # EV ≈ 0.25
        { 'name': 'major', 'probability': 0.00050, 'multiplier': 100 },  # EV ≈ 1.25
        { 'name': 'minor', 'probability': 0.00800, 'multiplier': 10 },   # EV ≈ 2.50
    ],
    'Booster Premium': [
        { 'name': 'grand', 'probability': 0.00001, 'multiplier': 200 },  # EV ≈ 0.15
        { 'name': 'major', 'probability': 0.00020, 'multiplier': 50 },   # EV ≈ 0.75
        { 'name': 'minor', 'probability': 0.00550, 'multiplier': 10 },   # EV ≈ 4.125
    ],
    'Booster Lendário': [
        { 'name': 'grand', 'probability': 0.00010, 'multiplier': 100 },  # EV ≈ 2.50
        { 'name': 'major', 'probability': 0.00040, 'multiplier': 25 },   # EV ≈ 2.50
        { 'name': 'minor', 'probability': 0.00600, 'multiplier': 5 },    # EV ≈ 7.50
    ],
}

def select_rarity(distribution: dict) -> str:
    """Layer 1: Selecionar raridade base"""
    rand = random.random() * 100
    cumulative = 0
    
    for rarity in ['trash', 'meme', 'viral', 'legendary', 'epica']:
        cumulative += distribution.get(rarity, 0)
        if rand < cumulative:
            return rarity
    
    return 'trash'

def select_skin() -> str:
    """Layer 2: Selecionar skin"""
    total = sum(SKIN_WEIGHTS.values())
    rand = random.random() * total
    cumulative = 0
    
    for skin, weight in SKIN_WEIGHTS.items():
        cumulative += weight
        if rand < cumulative:
            return skin
    
    return 'default'

def decide_booster_godmode(can_award: bool, forced: bool = False, probability: float = 0.01) -> bool:
    """Decide uma vez por booster se haverá godmode (1% padrão)"""
    if forced:
        return True
    if not can_award:
        return False
    return random.random() < probability

def calculate_liquidity(
    base_liquidity: float,
    skin_multiplier: float,
    price_multiplier: float,
    is_godmode: bool,
    godmode_multiplier: float = 10
) -> float:
    """Calcular liquidez final: base × skin × price × godmode"""
    # Aplicar cap em skin_multiplier para evitar cartas muito caras sem godmode
    skin_multiplier_capped = min(skin_multiplier, SKIN_MULTIPLIER_CAPS.get('default', 1.0))
    liquidity = base_liquidity * skin_multiplier_capped * price_multiplier
    if is_godmode:
        liquidity *= godmode_multiplier
    return round(liquidity, 2)

def simulate_booster_opening(
    booster_type: dict,
    edition_config: dict,
    cards_pool: list,
    pity_counter: int = 0
) -> dict:
    """Simula abertura de 1 booster"""
    
    cards_per_booster = booster_type['cards_per_booster']
    distribution = booster_type['rarity_distribution']
    price_multiplier = booster_type.get('price_multiplier', 1.0)
    
    base_liquidity = edition_config['base_liquidity']
    skin_multipliers = edition_config['skin_multipliers']
    godmode_multiplier = edition_config['godmode_multiplier']
    godmode_probability = edition_config['godmode_probability']
    
    # Pity system: 180 boosters = forçar godmode (alinhado ao backend)
    forced_godmode = pity_counter >= 180
    
    generated_cards = []
    # Decidir uma vez se este booster terá godmode (máx. 1 card)
    booster_has_godmode = decide_booster_godmode(True, forced_godmode, godmode_probability)
    godmode_awarded = False
    
    for idx in range(cards_per_booster):
        rarity = select_rarity(distribution)
        skin = select_skin()
        
        # Aplicar godmode somente na primeira carta se o booster tiver godmode
        is_godmode = booster_has_godmode and not godmode_awarded
        if is_godmode:
            godmode_awarded = True
        
        # Pegar carta aleatória dessa raridade
        rarity_cards = [c for c in cards_pool if c['rarity'] == rarity]
        if not rarity_cards:
            continue
        
        card = random.choice(rarity_cards)
        
        # Calcular liquidez
        base_liq = base_liquidity.get(rarity, 0.01)
        skin_mult = skin_multipliers.get(skin, 1.0)
        # Cap específico por skin na simulação
        skin_mult = min(skin_mult, SKIN_MULTIPLIER_CAPS.get(skin, skin_mult))
        liquidity = calculate_liquidity(
            base_liq,
            skin_mult,
            price_multiplier,
            is_godmode,
            godmode_multiplier
        )
        
        generated_cards.append({
            'card_name': card['name'],
            'rarity': rarity,
            'skin': skin,
            'is_godmode': is_godmode,
            'liquidity_brl': liquidity
        })
    
    # Jackpot tiers (raspadinha): aplica ao booster inteiro, adicionando payout ao total
    jackpot_payout = 0.0
    jt_map = edition_config.get('jackpot_tiers') or {}
    tiers = jt_map.get(booster_type['name']) if isinstance(jt_map, dict) else None
    if tiers:
        # Checa do maior para menor; no máximo um jackpot por booster
        # price_brl vem do booster_type
        price_brl = booster_type.get('price_brl', 0)
        for tier in sorted(tiers, key=lambda t: {'grand':3,'major':2,'minor':1}.get(t.get('name','minor'),0), reverse=True):
            prob = float(tier.get('probability', 0))
            mult = float(tier.get('multiplier', 0))
            if prob > 0 and mult > 0 and random.random() < prob:
                jackpot_payout = round(price_brl * mult, 2)
                break

    total_liquidity = sum(c['liquidity_brl'] for c in generated_cards) + jackpot_payout
    
    return {
        'cards': generated_cards,
        'total_liquidity': total_liquidity,
        'godmode_awarded': godmode_awarded,
        'pity_reset': forced_godmode,
        'jackpot_payout': jackpot_payout
    }

def run_simulation(
    booster_name: str,
    num_openings: int = 1000,
    verbose: bool = False
):
    """Executa simulação de N aberturas de boosters"""
    
    print(f"\n{'='*80}")
    print(f"🎲 SIMULAÇÃO DE BOOSTERS KROOVA")
    print(f"{'='*80}\n")
    
    # 1. Buscar booster type (Supabase ou offline)
    if supabase:
        response = supabase.table('booster_types').select('*').eq('name', booster_name).execute()
        if not response.data:
            print(f"❌ Booster '{booster_name}' não encontrado!")
            return
        booster = response.data[0]
        edition_id = booster['edition_id']
    else:
        offline_path = os.path.join(os.path.dirname(__file__), 'offline-config.json')
        with open(offline_path, 'r', encoding='utf-8') as f:
            offline = json.load(f)
        boosters = offline['booster_types']
        booster = next((b for b in boosters if b['name'] == booster_name), None)
        if not booster:
            print(f"❌ Booster '{booster_name}' não encontrado no offline-config!")
            return
        edition_id = booster.get('edition_id', 'ED01')
    
    print(f"📦 Booster: {booster['name']}")
    print(f"💰 Preço: R$ {booster['price_brl']:.2f}")
    print(f"🎴 Cartas por booster: {booster['cards_per_booster']}")
    print(f"📚 Edição: {edition_id}")
    print(f"🔄 Número de aberturas: {num_openings:,}\n")
    
    # 2. Buscar edition config
    if supabase:
        response = supabase.table('edition_configs').select('*').eq('id', edition_id).execute()
        if not response.data:
            print(f"❌ Edição '{edition_id}' não encontrada!")
            return
        edition = response.data[0]
    else:
        edition = offline['edition_configs'][edition_id]
    
    # 3. Buscar pool de cartas
    if supabase:
        response = supabase.table('cards_base').select('*').eq('edition_id', edition_id).execute()
        cards_pool = response.data
    else:
        cards_pool = [c for c in offline['cards_base'] if c['edition_id'] == edition_id]
    
    print(f"🎴 Pool de cartas: {len(cards_pool)} cartas disponíveis\n")
    
    # 4. Executar simulação
    results = []
    pity_counter = 0
    total_spent = 0
    total_returned = 0
    
    rarity_counts = Counter()
    skin_counts = Counter()
    godmode_count = 0
    
    for i in range(num_openings):
        # Ensure jackpot tiers exist in edition for simulation
        if 'jackpot_tiers' not in edition or not isinstance(edition.get('jackpot_tiers'), dict):
            edition['jackpot_tiers'] = DEFAULT_JACKPOT_TIERS
        result = simulate_booster_opening(booster, edition, cards_pool, pity_counter)
        results.append(result)
        
        total_spent += booster['price_brl']
        total_returned += result['total_liquidity']
        
        if result['godmode_awarded']:
            godmode_count += 1
            pity_counter = 0  # Reset
        else:
            pity_counter += 1
        
        if result['pity_reset']:
            pity_counter = 0
        
        for card in result['cards']:
            rarity_counts[card['rarity']] += 1
            skin_counts[card['skin']] += 1
        
        if verbose and (i + 1) % 100 == 0:
            print(f"Progresso: {i + 1:,}/{num_openings:,} ({(i+1)/num_openings*100:.1f}%)")
    
    # 5. Análise de resultados
    print(f"\n{'='*80}")
    print(f"📊 RESULTADOS DA SIMULAÇÃO")
    print(f"{'='*80}\n")
    
    # RTP (Return to Player)
    rtp = (total_returned / total_spent) * 100
    print(f"💰 ECONOMIA:")
    print(f"   Gasto total: R$ {total_spent:,.2f}")
    print(f"   Retorno total (liquidez): R$ {total_returned:,.2f}")
    print(f"   RTP: {rtp:.2f}%")
    print(f"   {'✅ LUCRATIVO' if rtp > 100 else '⚠️  PREJUÍZO'} para o jogador\n")
    
    # Distribuição de raridades
    total_cards = sum(rarity_counts.values())
    print(f"🎴 DISTRIBUIÇÃO DE RARIDADES (total: {total_cards:,} cartas):")
    for rarity in ['trash', 'meme', 'viral', 'legendary', 'epica']:
        count = rarity_counts[rarity]
        pct = (count / total_cards * 100) if total_cards > 0 else 0
        expected = booster['rarity_distribution'].get(rarity, 0)
        diff = pct - expected
        print(f"   {rarity.ljust(10)}: {count:>6,} ({pct:>5.2f}%) [esperado: {expected:>5.2f}%] diff: {diff:+.2f}%")
    
    print(f"\n✨ GODMODE:")
    godmode_rate = (godmode_count / num_openings * 100)
    expected_godmode = edition['godmode_probability'] * 100
    print(f"   Godmodes concedidos: {godmode_count:,} ({godmode_rate:.2f}%)")
    print(f"   Taxa esperada: {expected_godmode:.2f}%")
    print(f"   Diferença: {godmode_rate - expected_godmode:+.2f}%\n")
    
    # Top 5 skins
    print(f"🎨 TOP 5 SKINS:")
    for skin, count in skin_counts.most_common(5):
        pct = (count / total_cards * 100) if total_cards > 0 else 0
        expected = SKIN_WEIGHTS[skin] / sum(SKIN_WEIGHTS.values()) * 100
        print(f"   {skin.ljust(10)}: {count:>6,} ({pct:>5.2f}%) [esperado: {expected:>5.2f}%]")
    
    # Estatísticas por booster
    liquidities = [r['total_liquidity'] for r in results]
    jackpots = [r['jackpot_payout'] for r in results]
    avg_liquidity = sum(liquidities) / len(liquidities)
    min_liquidity = min(liquidities)
    max_liquidity = max(liquidities)
    
    print(f"\n💎 LIQUIDEZ POR BOOSTER:")
    print(f"   Média: R$ {avg_liquidity:.2f}")
    print(f"   Mínima: R$ {min_liquidity:.2f}")
    print(f"   Máxima: R$ {max_liquidity:.2f}")
    print(f"   Retorno médio vs Custo: {(avg_liquidity / booster['price_brl'] * 100):.2f}%\n")
    if any(jackpots):
        print(f"🎰 JACKPOTS:")
        print(f"   Quantidade: {sum(1 for j in jackpots if j>0):,}")
        print(f"   Maior Jackpot: R$ {max(jackpots):.2f}")
        jp_ev = sum(jackpots)/len(jackpots) if jackpots else 0.0
        print(f"   EV médio por booster: R$ {jp_ev:.4f}")
    
    # Melhor e pior booster
    best = max(results, key=lambda r: r['total_liquidity'])
    worst = min(results, key=lambda r: r['total_liquidity'])
    
    print(f"🏆 MELHOR BOOSTER:")
    print(f"   Liquidez: R$ {best['total_liquidity']:.2f}")
    print(f"   Godmode: {'✨ SIM' if best['godmode_awarded'] else 'não'}")
    print(f"   Cartas:")
    for card in best['cards']:
        gm = '✨' if card['is_godmode'] else ''
        print(f"      {gm} {card['card_name']} ({card['rarity']}, {card['skin']}) - R$ {card['liquidity_brl']:.2f}")
    
    print(f"\n💩 PIOR BOOSTER:")
    print(f"   Liquidez: R$ {worst['total_liquidity']:.2f}")
    print(f"   Cartas:")
    for card in worst['cards']:
        print(f"      {card['card_name']} ({card['rarity']}, {card['skin']}) - R$ {card['liquidity_brl']:.2f}")
    
    print(f"\n{'='*80}\n")
    
    return {
        'rtp': rtp,
        'total_spent': total_spent,
        'total_returned': total_returned,
        'godmode_count': godmode_count,
        'godmode_rate': godmode_rate,
        'rarity_counts': dict(rarity_counts),
        'skin_counts': dict(skin_counts),
        'avg_liquidity': avg_liquidity
    }

if __name__ == '__main__':
    import sys
    
    # Parâmetros
    booster_name = sys.argv[1] if len(sys.argv) > 1 else 'Basico'
    num_openings = int(sys.argv[2]) if len(sys.argv) > 2 else 1000
    verbose = '--verbose' in sys.argv or '-v' in sys.argv
    
    try:
        results = run_simulation(booster_name, num_openings, verbose)
        
        # Salvar resultados
        output_file = f'simulation_results_{booster_name}_{num_openings}.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Resultados salvos em: {output_file}")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Simulação interrompida pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        import traceback
        traceback.print_exc()
