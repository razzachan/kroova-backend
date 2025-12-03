import os
import re
from dotenv import load_dotenv
import requests

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Liquidez fixa por raridade
LIQUIDITY_MAP = {
    'trash': 0.01,
    'meme': 0.03,
    'viral': 0.10,
    'legendary': 0.50,
    'godmode': 1.00
}

def calculate_influence_from_description(name, description, rarity):
    """Calcula influence_score baseado em nome + descrição"""
    text = f"{name} {description}".lower()
    
    # Palavras que indicam alta influência
    high_impact = ['viral', 'trending', 'famoso', 'celebridade', 'influencer', 'milhões', 
                   'fenômeno', 'explosão', 'hype', 'icônico', 'lendário', 'divino']
    
    medium_impact = ['popular', 'conhecido', 'relevante', 'curtidas', 'seguidores',
                     'views', 'compartilhamentos', 'engajamento', 'alcance']
    
    low_impact = ['desconhecido', 'esquecido', 'irrelevante', 'falhou', 'fracassou']
    
    score = 50  # base
    
    # Ajusta pela raridade
    rarity_bonus = {
        'trash': 0,
        'meme': 10,
        'viral': 20,
        'legendary': 30,
        'godmode': 40
    }
    score += rarity_bonus.get(rarity, 0)
    
    # Conta palavras de impacto
    for word in high_impact:
        if word in text:
            score += 8
    
    for word in medium_impact:
        if word in text:
            score += 4
    
    for word in low_impact:
        if word in text:
            score -= 5
    
    # Tamanho da descrição (mais longo = mais elaborado = mais influente)
    if len(description) > 120:
        score += 5
    
    # Limita entre 1-100
    return max(1, min(100, score))


def calculate_rarity_score_from_rarity(rarity):
    """Mapeia raridade string para rarity_score numérico"""
    score_map = {
        'trash': 15,      # 0-30
        'meme': 45,       # 31-60
        'viral': 73,      # 61-85
        'legendary': 90,  # 86-95
        'godmode': 98     # 96-100
    }
    return score_map.get(rarity, 15)


def get_all_cards():
    """Busca todas as cartas ED01"""
    url = f"{SUPABASE_URL}/rest/v1/cards_base"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    }
    params = {
        'select': 'id,display_id,name,description,rarity',
        'edition_id': 'eq.ED01'
    }
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()


def update_card(card_id, influence_score, rarity_score, base_liquidity_brl):
    """Atualiza uma carta no banco"""
    url = f"{SUPABASE_URL}/rest/v1/cards_base"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    params = {
        'id': f'eq.{card_id}'
    }
    data = {
        'influence_score': influence_score,
        'rarity_score': rarity_score,
        'base_liquidity_brl': base_liquidity_brl
    }
    
    response = requests.patch(url, headers=headers, params=params, json=data)
    response.raise_for_status()


def main():
    print("🔄 Atualizando influence_score, rarity_score e base_liquidity_brl...")
    print("=" * 70)
    
    cards = get_all_cards()
    print(f"✅ {len(cards)} cartas carregadas\n")
    
    updated = 0
    errors = 0
    
    for card in cards:
        try:
            # Calcula scores
            influence = calculate_influence_from_description(
                card['name'], 
                card.get('description', ''), 
                card['rarity']
            )
            
            rarity_score = calculate_rarity_score_from_rarity(card['rarity'])
            liquidity = LIQUIDITY_MAP.get(card['rarity'], 0.01)
            
            # Atualiza no banco
            update_card(card['id'], influence, rarity_score, liquidity)
            
            updated += 1
            print(f"✅ [{updated}/{len(cards)}] {card['display_id']}: influence={influence}, rarity={rarity_score}, liq=R${liquidity:.2f}")
            
        except Exception as e:
            errors += 1
            print(f"❌ Erro em {card.get('display_id', '?')}: {e}")
    
    print("\n" + "=" * 70)
    print(f"✅ Atualização completa!")
    print(f"   Sucesso: {updated}")
    print(f"   Erros: {errors}")
    print(f"   Total: {len(cards)}")


if __name__ == '__main__':
    main()
