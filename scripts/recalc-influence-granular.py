#!/usr/bin/env python3
"""
Recalcula influence_score com números mais variados (não múltiplos de 5)
Para criar mais diferenciação competitiva entre cartas
"""

import os
import hashlib
from dotenv import load_dotenv
import requests

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

HIGH_INFLUENCE_KEYWORDS = [
    'viral', 'trend', 'famous', 'influencer', 'celebrity', 'icon',
    'milhões', 'bilhões', 'followers', 'views', 'likes', 'shares',
    'polêmic', 'controversi', 'scandal', 'trending', 'viral',
    'meme', 'legend', 'god', 'supremo', 'rei', 'rainha',
    'domina', 'controla', 'poder', 'influência', 'manipula'
]

def calculate_influence_granular(name: str, description: str) -> int:
    """
    Calcula influence com números variados: 3, 7, 11, 13, 17, 19, 23, 27, 31, etc
    Range completo: 1-100
    """
    text = (name + ' ' + description).lower()
    
    # Score base por keywords (0-50)
    keyword_matches = sum(1 for kw in HIGH_INFLUENCE_KEYWORDS if kw in text)
    keyword_score = min(50, keyword_matches * 9)
    
    # Score por complexidade do texto (0-35)
    words = len(description.split())
    if words > 100:
        complexity = 33
    elif words > 80:
        complexity = 27
    elif words > 60:
        complexity = 21
    elif words > 40:
        complexity = 14
    elif words > 20:
        complexity = 8
    else:
        complexity = 3
    
    # Score pelo nome (0-20)
    name_len = len(name)
    if name_len <= 4:
        name_score = 18
    elif name_len <= 6:
        name_score = 14
    elif name_len <= 8:
        name_score = 9
    elif name_len <= 10:
        name_score = 6
    else:
        name_score = 3
    
    # Score total (0-105 base antes de normalizar)
    # keywords (50%) + complexity (33%) + name (17%)
    raw = keyword_score + complexity * 0.7 + name_score * 0.85
    
    # Normalizar para 0-90
    base_total = int(raw * 0.85)
    
    # Adicionar variação única baseada em hash (consistente por nome)
    name_hash = int(hashlib.md5(name.encode()).hexdigest()[:4], 16)
    variance = (name_hash % 17) - 8  # -8 a +8 de variação única
    
    final = base_total + variance
    
    # Garantir mínimo 1, máximo 100
    return min(100, max(1, final))

def get_all_cards():
    url = f"{SUPABASE_URL}/rest/v1/cards_base"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    }
    params = {
        'select': 'id,display_id,name,description,influence_score',
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

def main():
    print("🎯 Recalculando influence_score com números granulares...")
    print("=" * 70)
    
    cards = get_all_cards()
    print(f"✅ Carregadas {len(cards)} cartas\n")
    
    # Calcular nova distribuição
    new_values = []
    for card in cards:
        name = card['name'] or ''
        description = card['description'] or ''
        new_influence = calculate_influence_granular(name, description)
        new_values.append(new_influence)
    
    # Mostrar distribuição
    print("📊 NOVA DISTRIBUIÇÃO:")
    unique_values = sorted(set(new_values))
    print(f"   Valores únicos: {len(unique_values)}")
    print(f"   Min: {min(new_values)} | Max: {max(new_values)} | Média: {sum(new_values)/len(new_values):.1f}")
    print(f"   Exemplos: {sorted(unique_values)[:15]}...")
    print()
    
    # Confirmar
    response = input("⚠️  Atualizar todas as cartas? (yes/no): ").strip().lower()
    if response != 'yes':
        print("❌ Cancelado")
        return
    
    # Atualizar
    updated = 0
    for i, card in enumerate(cards, 1):
        name = card['name'] or ''
        description = card['description'] or ''
        new_influence = calculate_influence_granular(name, description)
        
        if card.get('influence_score') != new_influence:
            try:
                update_card_influence(card['id'], new_influence)
                print(f"[{i}/{len(cards)}] ✅ {card['display_id']}: {card.get('influence_score')} → {new_influence}")
                updated += 1
            except Exception as e:
                print(f"[{i}/{len(cards)}] ❌ {card['display_id']}: {e}")
        elif i % 50 == 0:
            print(f"[{i}/{len(cards)}] ⏭️  {i - updated} já atualizadas...")
    
    print("\n" + "=" * 70)
    print(f"✅ CONCLUÍDO - {updated} cartas atualizadas")
    print("=" * 70)

if __name__ == '__main__':
    main()
