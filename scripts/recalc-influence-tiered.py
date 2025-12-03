#!/usr/bin/env python3
"""
Sistema final de influence_score com ranges sobrepostos por raridade
Fórmula: (conteúdo base) * multiplicador_raridade, limitado por teto da raridade
"""

import os
import hashlib
from dotenv import load_dotenv
import requests

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Keywords de alta influência
HIGH_INFLUENCE_KEYWORDS = [
    'viral', 'trend', 'trending', 'famous', 'influencer', 'celebrity', 'icon',
    'milhões', 'bilhões', 'followers', 'views', 'likes', 'shares',
    'polêmic', 'controversi', 'scandal', 'exposed', 'cancelado',
    'meme', 'legend', 'lendário', 'mítico', 'épico',
    'god', 'supremo', 'rei', 'rainha', 'imperador',
    'domina', 'controla', 'poder', 'influência', 'manipula',
    'explosão', 'fenômeno', 'sensação', 'mania'
]

# Ranges sobrepostos por raridade
RARITY_CONFIG = {
    'trash': {
        'min': 1,
        'max': 35,
        'multiplier': 0.8
    },
    'meme': {
        'min': 15,
        'max': 55,
        'multiplier': 1.2
    },
    'viral': {
        'min': 35,
        'max': 75,
        'multiplier': 1.6
    },
    'legendary': {
        'min': 55,
        'max': 90,
        'multiplier': 2.0
    },
    'godmode': {
        'min': 75,
        'max': 100,
        'multiplier': 2.5
    }
}

def calculate_base_score(name: str, description: str) -> float:
    """
    Calcula score base de conteúdo (0-100 antes do multiplicador)
    """
    text = (name + ' ' + description).lower()
    
    # 1. Keywords de influência (0-45 pontos)
    keyword_matches = sum(1 for kw in HIGH_INFLUENCE_KEYWORDS if kw in text)
    keyword_score = min(45, keyword_matches * 7)
    
    # 2. Complexidade do texto (0-30 pontos)
    words = len(description.split())
    if words > 120:
        complexity = 30
    elif words > 90:
        complexity = 25
    elif words > 60:
        complexity = 18
    elif words > 40:
        complexity = 12
    elif words > 20:
        complexity = 7
    else:
        complexity = 3
    
    # 3. Qualidade do nome (0-25 pontos)
    name_len = len(name)
    if name_len <= 5:
        name_score = 22
    elif name_len <= 8:
        name_score = 18
    elif name_len <= 12:
        name_score = 13
    elif name_len <= 16:
        name_score = 9
    else:
        name_score = 5
    
    # Score base total (0-100)
    base = keyword_score + complexity + name_score
    
    return base

def calculate_influence_final(name: str, description: str, rarity: str) -> int:
    """
    Calcula influence final aplicando multiplicador e limites de raridade
    """
    # Score base de conteúdo
    base_score = calculate_base_score(name, description)
    
    # Configuração da raridade
    config = RARITY_CONFIG.get(rarity, RARITY_CONFIG['trash'])
    
    # Aplicar multiplicador
    amplified = base_score * config['multiplier']
    
    # Adicionar variação única por nome (consistente)
    name_hash = int(hashlib.md5(name.encode()).hexdigest()[:4], 16)
    variance = (name_hash % 13) - 6  # -6 a +6
    
    final = amplified + variance
    
    # Aplicar limites min/max da raridade
    final = max(config['min'], min(config['max'], int(final)))
    
    return final

def get_all_cards():
    url = f"{SUPABASE_URL}/rest/v1/cards_base"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    params = {
        'select': 'id,display_id,name,description,rarity,influence_score',
        'edition_id': 'eq.ED01'
    }
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

def update_card_influence(card_id: str, influence: int):
    url = f"{SUPABASE_URL}/rest/v1/cards_base"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    params = {'id': f'eq.{card_id}'}
    data = {'influence_score': influence}
    
    response = requests.patch(url, headers=headers, params=params, json=data)
    response.raise_for_status()

def calculate_rarity_score_final(name: str, description: str, rarity: str) -> int:
    """
    Calcula rarity_score usando mesmo método do influence
    Conteúdo base * multiplicador de raridade
    """
    # Ranges e multiplicadores por raridade
    rarity_config = {
        'trash': {'min': 5, 'max': 30, 'multiplier': 0.7},
        'meme': {'min': 20, 'max': 50, 'multiplier': 1.1},
        'viral': {'min': 40, 'max': 70, 'multiplier': 1.5},
        'legendary': {'min': 60, 'max': 85, 'multiplier': 1.9},
        'godmode': {'min': 75, 'max': 95, 'multiplier': 2.3}
    }
    
    config = rarity_config.get(rarity, rarity_config['trash'])
    
    # Keywords de exclusividade (mais amplo)
    exclusive_keywords = [
        'único', 'raro', 'exclusivo', 'lend', 'mítico', 'épico',
        'special', 'rare', 'exclusive', 'limited', 'icon',
        'primeir', 'original', 'históric', 'clássic', 'antigo',
        'supremo', 'deus', 'god', 'rei', 'rainha', 'imperador'
    ]
    
    text = (name + ' ' + description).lower()
    
    # 1. Keywords (0-40)
    keyword_matches = sum(1 for kw in exclusive_keywords if kw in text)
    keyword_score = min(40, keyword_matches * 8)
    
    # 2. Tamanho do nome (nomes curtos são mais memoráveis) (0-25)
    name_len = len(name)
    if name_len <= 5:
        name_score = 23
    elif name_len <= 8:
        name_score = 18
    elif name_len <= 12:
        name_score = 12
    else:
        name_score = 7
    
    # 3. Complexidade da descrição (0-35)
    words = len(description.split())
    if words > 100:
        complexity = 32
    elif words > 70:
        complexity = 25
    elif words > 50:
        complexity = 18
    elif words > 30:
        complexity = 11
    else:
        complexity = 6
    
    # Score base (0-100)
    base_score = keyword_score + name_score + complexity
    
    # Aplicar multiplicador de raridade
    amplified = base_score * config['multiplier']
    
    # Variação única por nome
    name_hash = int(hashlib.md5(name.encode()).hexdigest()[:4], 16)
    variance = (name_hash % 17) - 8  # -8 a +8
    
    final = amplified + variance
    
    # Limites
    return max(config['min'], min(config['max'], int(final)))

def update_card_rarity_score(card_id: str, rarity_score: int):
    url = f"{SUPABASE_URL}/rest/v1/cards_base"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    params = {'id': f'eq.{card_id}'}
    data = {'rarity_score': rarity_score}
    
    response = requests.patch(url, headers=headers, params=params, json=data)
    response.raise_for_status()

def main():
    print("🎯 Sistema Final: Influence + Rarity com Ranges Sobrepostos")
    print("=" * 70)
    print("\n📊 RANGES POR RARIDADE:")
    print("\n⚔️  INFLUENCE_SCORE:")
    for rarity, cfg in RARITY_CONFIG.items():
        print(f"   {rarity:10s} → {cfg['min']:3d}-{cfg['max']:3d} (mult: {cfg['multiplier']}x)")
    
    print("\n👑 RARITY_SCORE:")
    rarity_ranges = {
        'trash': (5, 30),
        'meme': (20, 50),
        'viral': (40, 70),
        'legendary': (60, 85),
        'godmode': (75, 95)
    }
    for rarity, (min_r, max_r) in rarity_ranges.items():
        print(f"   {rarity:10s} → {min_r:3d}-{max_r:3d}")
    print()
    
    cards = get_all_cards()
    print(f"✅ Carregadas {len(cards)} cartas\n")
    
    # Agrupar por raridade para preview
    by_rarity_influence = {}
    by_rarity_rarity = {}
    
    for card in cards:
        rarity = card.get('rarity', 'trash')
        if rarity not in by_rarity_influence:
            by_rarity_influence[rarity] = []
            by_rarity_rarity[rarity] = []
        
        name = card['name'] or ''
        description = card['description'] or ''
        new_influence = calculate_influence_final(name, description, rarity)
        new_rarity_score = calculate_rarity_score_final(name, description, rarity)
        
        by_rarity_influence[rarity].append(new_influence)
        by_rarity_rarity[rarity].append(new_rarity_score)
    
    # Mostrar preview da distribuição
    print("📈 PREVIEW - INFLUENCE_SCORE:")
    for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
        if rarity in by_rarity_influence:
            values = by_rarity_influence[rarity]
            print(f"   {rarity:10s} ({len(values):3d} cartas) → "
                  f"Min: {min(values):2d} | Max: {max(values):2d} | "
                  f"Média: {sum(values)/len(values):.1f}")
    
    print("\n📈 PREVIEW - RARITY_SCORE:")
    for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
        if rarity in by_rarity_rarity:
            values = by_rarity_rarity[rarity]
            print(f"   {rarity:10s} ({len(values):3d} cartas) → "
                  f"Min: {min(values):2d} | Max: {max(values):2d} | "
                  f"Média: {sum(values)/len(values):.1f}")
    print()
    
    # Confirmar
    response = input("⚠️  Atualizar INFLUENCE e RARITY de todas as cartas? (yes/no): ").strip().lower()
    if response != 'yes':
        print("❌ Cancelado")
        return
    
    print()
    
    # Atualizar
    updated_influence = 0
    updated_rarity = 0
    errors = 0
    
    for i, card in enumerate(cards, 1):
        name = card['name'] or ''
        description = card['description'] or ''
        rarity = card.get('rarity', 'trash')
        new_influence = calculate_influence_final(name, description, rarity)
        new_rarity_score = calculate_rarity_score_final(name, description, rarity)
        
        changed = False
        try:
            if card.get('influence_score') != new_influence:
                update_card_influence(card['id'], new_influence)
                updated_influence += 1
                changed = True
            
            if card.get('rarity_score') != new_rarity_score:
                update_card_rarity_score(card['id'], new_rarity_score)
                updated_rarity += 1
                changed = True
            
            if changed and (updated_influence + updated_rarity <= 40 or i % 50 == 0):
                print(f"[{i}/{len(cards)}] ✅ {card['display_id']:12s} ({rarity:10s}): "
                      f"inf {card.get('influence_score', 0):2d}→{new_influence:2d} | "
                      f"rar {card.get('rarity_score', 0):2d}→{new_rarity_score:2d}")
        except Exception as e:
            errors += 1
            print(f"[{i}/{len(cards)}] ❌ {card['display_id']}: {e}")
    
    print("\n" + "=" * 70)
    print(f"✅ CONCLUÍDO")
    print(f"   Influence atualizadas: {updated_influence}")
    print(f"   Rarity atualizadas: {updated_rarity}")
    print(f"   Sem mudanças: {len(cards) - updated_influence - updated_rarity - errors}")
    print(f"   Erros: {errors}")
    print("=" * 70)
    
    # Estatísticas finais
    print("\n📊 DISTRIBUIÇÃO FINAL:")
    print("\n⚔️  INFLUENCE_SCORE:")
    for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
        if rarity in by_rarity_influence:
            values = by_rarity_influence[rarity]
            config = RARITY_CONFIG[rarity]
            print(f"   {rarity:10s} → Range: {config['min']:3d}-{config['max']:3d} | "
                  f"Real: {min(values):2d}-{max(values):2d} | "
                  f"Média: {sum(values)/len(values):.1f}")
    
    print("\n👑 RARITY_SCORE:")
    for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
        if rarity in by_rarity_rarity:
            values = by_rarity_rarity[rarity]
            rarity_ranges = {
                'trash': (5, 30),
                'meme': (20, 50),
                'viral': (40, 70),
                'legendary': (60, 85),
                'godmode': (75, 95)
            }
            min_r, max_r = rarity_ranges[rarity]
            print(f"   {rarity:10s} → Range: {min_r:3d}-{max_r:3d} | "
                  f"Real: {min(values):2d}-{max(values):2d} | "
                  f"Média: {sum(values)/len(values):.1f}")

if __name__ == '__main__':
    main()
