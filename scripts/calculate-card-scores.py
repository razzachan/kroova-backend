#!/usr/bin/env python3
"""
Script para calcular influence_score, rarity_score e base_liquidity_brl
baseado no nome e descrição de cada carta (conteúdo semântico)
"""

import os
import re
from dotenv import load_dotenv
import requests

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Liquidez base por raridade (mantém economia)
RARITY_LIQUIDITY = {
    'trash': 0.01,
    'meme': 0.03,
    'viral': 0.10,
    'legendary': 0.50,
    'godmode': 1.00
}

# Palavras-chave que aumentam influence_score (viralidade/impacto)
HIGH_INFLUENCE_KEYWORDS = [
    'viral', 'trend', 'famous', 'influencer', 'celebrity', 'icon',
    'milhões', 'bilhões', 'followers', 'views', 'likes', 'shares',
    'polêmic', 'controversi', 'scandal', 'trending', 'viral',
    'meme', 'legend', 'god', 'supremo', 'rei', 'rainha',
    'domina', 'controla', 'poder', 'influência', 'manipula'
]

# Palavras que aumentam rarity_score (exclusividade/raridade)
HIGH_RARITY_KEYWORDS = [
    'único', 'raro', 'exclusivo', 'lendário', 'épico', 'supremo',
    'ultimate', 'god', 'divino', 'transcendent', 'místico',
    'proibido', 'secreto', 'oculto', 'perdido', 'ancient',
    'primeiro', 'último', 'original', 'criador', 'fundador'
]

def calculate_keyword_score(text: str, keywords: list) -> int:
    """Calcula score baseado em keywords (0-50)"""
    text_lower = text.lower()
    matches = sum(1 for kw in keywords if kw in text_lower)
    # Cada match vale ~10 pontos, cap em 50
    return min(50, matches * 10)

def calculate_text_complexity_score(text: str) -> int:
    """Score baseado em complexidade do texto (0-30)"""
    # Textos mais longos e complexos = mais raros
    words = len(text.split())
    if words > 100:
        return 30
    elif words > 70:
        return 20
    elif words > 40:
        return 10
    return 0

def calculate_name_score(name: str) -> int:
    """Score baseado no nome (0-20)"""
    # Nomes mais curtos/impactantes = mais raros
    length = len(name)
    if length <= 6:
        return 20  # Nomes curtos são memoráveis
    elif length <= 10:
        return 10
    return 5

def calculate_influence_score(name: str, description: str) -> int:
    """
    Calcula influence_score (5-30) baseado em conteúdo
    Valores redondos para balanceamento competitivo
    """
    keyword_score = calculate_keyword_score(name + ' ' + description, HIGH_INFLUENCE_KEYWORDS)
    name_score = calculate_name_score(name)
    complexity_score = calculate_text_complexity_score(description)
    
    # Fórmula: keywords (50%) + nome (20%) + complexidade (30%)
    raw_score = int(keyword_score * 0.5 + name_score + complexity_score * 0.3)
    
    # Arredondar para valores competitivos: 5, 10, 15, 20, 25, 30
    if raw_score >= 28:
        return 30  # Elite
    elif raw_score >= 23:
        return 25  # Muito forte
    elif raw_score >= 18:
        return 20  # Forte
    elif raw_score >= 13:
        return 15  # Médio-alto
    elif raw_score >= 8:
        return 10  # Médio
    else:
        return 5   # Básico
    
def calculate_rarity_score(name: str, description: str, rarity: str) -> int:
    """
    ATENÇÃO: NÃO ALTERAR - rarity_score está vinculado à liquidez fixa
    Mantém cálculo original para não quebrar economia
    """
    keyword_score = calculate_keyword_score(name + ' ' + description, HIGH_RARITY_KEYWORDS)
    complexity_score = calculate_text_complexity_score(description)
    
    # Score base por raridade (MANTÉM ECONOMIA)
    rarity_base = {
        'trash': 10,
        'meme': 30,
        'viral': 50,
        'legendary': 75,
        'godmode': 95
    }.get(rarity, 20)
    
    # Fórmula: base (60%) + keywords (25%) + complexidade (15%)
    total = int(rarity_base * 0.6 + keyword_score * 0.25 + complexity_score * 0.15)
    return min(100, max(0, total))

def get_all_cards():
    """Busca todas as cartas do banco"""
    url = f"{SUPABASE_URL}/rest/v1/cards_base"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    params = {
        'select': 'id,display_id,name,description,rarity,influence_score,rarity_score,base_liquidity_brl',
        'edition_id': 'eq.ED01'
    }
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

def update_card(card_id: str, influence: int, rarity_score: int, liquidity: float):
    """Atualiza uma carta no banco"""
    url = f"{SUPABASE_URL}/rest/v1/cards_base"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    params = {'id': f'eq.{card_id}'}
    data = {
        'influence_score': influence,
        'rarity_score': rarity_score,
        'base_liquidity_brl': liquidity
    }
    
    response = requests.patch(url, headers=headers, params=params, json=data)
    response.raise_for_status()

def main():
    print("🎯 Calculando scores baseados em conteúdo das cartas...")
    print("=" * 70)
    
    cards = get_all_cards()
    print(f"✅ Carregadas {len(cards)} cartas\n")
    
    updated = 0
    skipped = 0
    
    for i, card in enumerate(cards, 1):
        name = card['name'] or ''
        description = card['description'] or ''
        rarity = card['rarity'] or 'trash'
        
        # Calcular scores
        influence = calculate_influence_score(name, description)
        rarity_score = calculate_rarity_score(name, description, rarity)
        liquidity = RARITY_LIQUIDITY.get(rarity, 0.01)
        
        # Só atualiza se mudou
        current_influence = card.get('influence_score')
        current_rarity = card.get('rarity_score')
        current_liquidity = card.get('base_liquidity_brl')
        
        if (current_influence != influence or 
            current_rarity != rarity_score or 
            current_liquidity != liquidity):
            
            try:
                update_card(card['id'], influence, rarity_score, liquidity)
                print(f"[{i}/{len(cards)}] ✅ {card['display_id']}: influence={influence}, rarity={rarity_score}, R${liquidity:.2f}")
                updated += 1
            except Exception as e:
                print(f"[{i}/{len(cards)}] ❌ {card['display_id']}: Erro - {e}")
        else:
            skipped += 1
            if i % 50 == 0:
                print(f"[{i}/{len(cards)}] ⏭️  {skipped} cartas já atualizadas...")
    
    print("\n" + "=" * 70)
    print(f"✅ CONCLUÍDO")
    print(f"   Atualizadas: {updated}")
    print(f"   Sem mudanças: {skipped}")
    print(f"   Total: {len(cards)}")
    print("=" * 70)

if __name__ == '__main__':
    main()
