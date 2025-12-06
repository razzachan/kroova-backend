import requests
import random
from collections import defaultdict
import statistics

SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

# Configuração de slots por tier
TIER_CONFIGS = {
    'basic': {
        'price': 0.50,
        'slots': [
            {'trash': 0.70, 'meme_low': 0.30},
            {'meme_low': 0.70, 'meme_mid': 0.30},
            {'meme_mid': 0.60, 'viral_low': 0.40},
            {'meme_low': 0.85, 'viral_low': 0.1299, 'legendary_low': 0.02, 'godmode_low': 0.0001},
            {'meme_low': 1.0}
        ]
    },
    'standard': {
        'price': 1.00,
        'slots': [
            {'trash': 0.70, 'meme_low': 0.30},
            {'meme_mid': 1.0},
            {'meme_high': 0.60, 'viral_low': 0.40},
            {'meme_mid': 0.70, 'viral_low': 0.2599, 'legendary_low': 0.04, 'godmode_low': 0.0001},
            {'meme_mid': 1.0}
        ]
    },
    'premium': {
        'price': 2.00,
        'slots': [
            {'trash_high': 0.50, 'meme_mid': 0.50},
            {'meme_high': 1.0},
            {'viral_mid': 0.70, 'viral_high': 0.30},
            {'meme_high': 0.50, 'viral_high': 0.40, 'legendary_low': 0.08, 'legendary_mid': 0.02},  # GODMODE REMOVIDO
            {'meme_high': 1.0}
        ]
    },
    'elite': {
        'price': 5.00,
        'slots': [
            {'meme_high': 0.50, 'viral_mid': 0.50},
            {'viral_mid': 1.0},
            {'viral_high': 1.0},
            {'viral_high': 0.30, 'legendary_mid': 0.50, 'legendary_high': 0.20},  # GODMODE REMOVIDO (era 0.02)
            {'viral_high': 1.0}
        ]
    },
    'whale': {
        'price': 10.00,
        'slots': [
            {'viral_high': 0.50, 'legendary_low': 0.50},
            {'viral_high': 1.0},
            {'legendary_low': 1.0},
            {'legendary_high': 1.0},  # GODMODE REMOVIDO (era 60% legendary + 40% godmode!)
            {'legendary_mid': 1.0}
        ]
    }
}

# Probabilidades de treatments
TREATMENT_PROBS = {
    'standard': 0.70,
    'glitch': 0.15,
    'holo': 0.08,
    'dark': 0.04,
    'spectral': 0.015,
    'primal': 0.01,
    'corrupted': 0.003,
    'void_holo': 0.0015,
    'legendary_glitch': 0.0005
}

TREATMENT_MULTIPLIERS = {
    'standard': 1.0,
    'glitch': 1.2,
    'holo': 1.4,
    'dark': 1.6,
    'spectral': 1.8,
    'primal': 2.0,
    'corrupted': 2.5,
    'void_holo': 3.0,
    'legendary_glitch': 4.0
}

def get_cards_pool(archetype):
    """Buscar pool de cartas por archetype"""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/cards_base",
        headers=headers,
        params={
            "select": "id,name,rarity,sub_rarity,base_liquidity_brl,pack_archetype",
            "pack_archetype": f"eq.{archetype}"
        }
    )
    
    if response.status_code != 200:
        print(f"❌ Erro ao buscar cartas: {response.status_code}")
        print(response.text)
        return []
    
    cards = response.json()
    
    # Debug: verificar se retornou lista
    if isinstance(cards, dict):
        print(f"⚠️  API retornou dict ao invés de list: {cards}")
        return []
    
    return cards

def select_card_from_slot(slot_config, cards_pool, tier):
    """Selecionar carta baseado no slot config"""
    rand = random.random()
    cumulative = 0
    
    for rarity_sub, prob in slot_config.items():
        cumulative += prob
        if rand < cumulative:
            # Parse rarity e sub_rarity
            if '_' in rarity_sub:
                rarity, sub_rarity = rarity_sub.split('_')
            else:
                rarity = rarity_sub
                sub_rarity = None
            
            # Filtrar cartas do pool
            candidates = [c for c in cards_pool if c['rarity'] == rarity]
            if sub_rarity:
                candidates = [c for c in candidates if c.get('sub_rarity') == sub_rarity]
            
            if candidates:
                return random.choice(candidates)
    
    # Fallback: carta trash aleatória
    return random.choice([c for c in cards_pool if c['rarity'] == 'trash'])

def roll_treatment(card_rarity):
    """Rolar treatment independente"""
    # Filtrar treatments incompatíveis
    available = TREATMENT_PROBS.copy()
    
    if card_rarity == 'trash':
        available = {k: v for k, v in available.items() if k in ['standard', 'glitch']}
    elif card_rarity == 'meme':
        available = {k: v for k, v in available.items() if k not in ['primal', 'corrupted', 'void_holo', 'legendary_glitch']}
    
    # Normalizar probabilidades
    total = sum(available.values())
    normalized = {k: v/total for k, v in available.items()}
    
    rand = random.random()
    cumulative = 0
    for treatment, prob in normalized.items():
        cumulative += prob
        if rand < cumulative:
            return treatment
    
    return 'standard'

def simulate_booster_opening(tier, archetype, cards_pool):
    """Simular abertura de 1 booster"""
    config = TIER_CONFIGS[tier]
    total_value = 0
    cards = []
    
    for slot in config['slots']:
        card = select_card_from_slot(slot, cards_pool, tier)
        treatment = roll_treatment(card['rarity'])
        
        base_value = float(card['base_liquidity_brl'])
        treatment_mult = TREATMENT_MULTIPLIERS[treatment]
        final_value = base_value * treatment_mult
        
        total_value += final_value
        cards.append({
            'name': card['name'],
            'rarity': card['rarity'],
            'sub_rarity': card.get('sub_rarity'),
            'treatment': treatment,
            'value': final_value
        })
    
    rtp = (total_value / config['price']) * 100
    return {
        'tier': tier,
        'archetype': archetype,
        'cards': cards,
        'total_value': total_value,
        'price': config['price'],
        'rtp': rtp
    }

def run_simulation(boosters_per_type=100):
    """Rodar simulação completa"""
    print("="*80)
    print("🎴 SIMULAÇÃO DO NOVO SISTEMA KROOVA")
    print("="*80)
    
    results = defaultdict(lambda: {'rtps': [], 'values': []})
    
    for tier in ['basic', 'standard', 'premium', 'elite', 'whale']:
        for archetype in ['alpha', 'beta', 'gamma']:
            print(f"\n📦 Carregando pool {tier}_{archetype}...")
            cards_pool = get_cards_pool(archetype)
            print(f"   Pool size: {len(cards_pool)} cartas")
            
            for i in range(boosters_per_type):
                result = simulate_booster_opening(tier, archetype, cards_pool)
                results[f"{tier}_{archetype}"]['rtps'].append(result['rtp'])
                results[f"{tier}_{archetype}"]['values'].append(result['total_value'])
                
                if (i + 1) % 25 == 0:
                    print(f"   Progresso: {i+1}/{boosters_per_type} boosters")
    
    # Análise de resultados
    print("\n" + "="*80)
    print("📊 RESULTADOS DA SIMULAÇÃO")
    print("="*80)
    
    for key in sorted(results.keys()):
        rtps = results[key]['rtps']
        avg_rtp = statistics.mean(rtps)
        min_rtp = min(rtps)
        max_rtp = max(rtps)
        stdev_rtp = statistics.stdev(rtps) if len(rtps) > 1 else 0
        
        status = "✅" if 65 <= avg_rtp <= 75 else "❌"
        
        print(f"\n{key.upper()}: {status}")
        print(f"  RTP médio: {avg_rtp:.1f}%")
        print(f"  RTP min/max: {min_rtp:.1f}% / {max_rtp:.1f}%")
        print(f"  Desvio padrão: {stdev_rtp:.1f}%")
        
        if not (65 <= avg_rtp <= 75):
            print(f"  ⚠️  AJUSTAR value_adjustment!")
    
    print("\n" + "="*80)

if __name__ == "__main__":
    run_simulation(100)
