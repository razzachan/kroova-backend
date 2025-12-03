"""Recalcular scores com variação semântica inteligente"""
import os
import requests
import hashlib
import re
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

# Buscar todas as cartas
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/cards_base",
    headers=headers,
    params={
        'select': 'id,name,description,rarity,influence_score,rarity_score',
        'edition_id': 'eq.ED01',
        'limit': '1000'
    }
)

cards = response.json()

def calculate_semantic_bonus(card, card_index):
    """
    Calcula bônus baseado em características semânticas da carta
    Retorna valor entre 0-30 que será adicionado aos scores base
    PRIORIZA UNICIDADE via índice da carta
    """
    name = card['name'] or ''
    desc = card['description'] or ''
    
    bonus = 0.0
    
    # 1. ÍNDICE DA CARTA - FATOR PRINCIPAL DE UNICIDADE (0-20 pontos)
    # Distribui cartas uniformemente pelo range
    # Ex: 177 trash / 45 range = ~4 cartas por valor
    # Índice garante espalhamento uniforme
    index_bonus = (card_index % 200) / 10.0  # 0-20 pontos
    bonus += index_bonus
    
    # 2. Hash do ID como fator secundário (0-15 pontos)
    hash_value = int(hashlib.md5(card['id'].encode()).hexdigest()[:8], 16)
    hash_bonus = (hash_value % 15000) / 1000  # 0-15 pontos
    bonus += hash_bonus
    
    # 3. Complexidade do nome
    unique_chars = len(set(name.lower().replace(' ', '')))
    bonus += min(unique_chars * 0.2, 2.0)  # Max +2 pontos
    
    # 4. Presença de palavras-chave de impacto
    power_words = {
        'viral': 1.5, 'meta': 1.5, 'legend': 2.0, 'epic': 2.0,
        'god': 2.5, 'supreme': 2.0, 'ultimate': 2.0, 'prime': 1.5
    }
    
    text_lower = (name + ' ' + desc).lower()
    for word, value in power_words.items():
        if word in text_lower:
            bonus += value
            break
    
    # 5. Uso de símbolos especiais
    special_chars = len(re.findall(r'[+\-*/$#@!?]', name))
    bonus += min(special_chars * 0.8, 1.5)  # Max +1.5 pontos
    
    # 6. Comprimento total do nome
    name_length = len(name.replace(' ', ''))
    bonus += min(name_length * 0.08, 1.5)  # Max +1.5 pontos
    
    return round(bonus, 2)

# Bases por raridade - RANGES EXPANDIDOS ao máximo (0-100)
RARITY_BASES = {
    'trash': {'influence': 5, 'rarity': 5},        # Range 5-50 (45 valores possíveis)
    'meme': {'influence': 30, 'rarity': 30},       # Range 30-70 (40 valores possíveis)
    'viral': {'influence': 50, 'rarity': 50},      # Range 50-85 (35 valores possíveis)
    'legendary': {'influence': 70, 'rarity': 70},  # Range 70-100 (30 valores possíveis)
    'godmode': {'influence': 100, 'rarity': 100}
}

# Recalcular scores
updates = []
print("🔄 RECALCULANDO SCORES COM VARIAÇÃO SEMÂNTICA...\n")

for idx, card in enumerate(cards):
    rarity = card['rarity']
    if rarity not in RARITY_BASES:
        continue
    
    base = RARITY_BASES[rarity]
    bonus = calculate_semantic_bonus(card, idx)  # Passa índice também
    
    # Godmode não muda (única carta lendária)
    if rarity == 'godmode':
        new_influence = 100
        new_rarity = 100
    else:
        new_influence = min(base['influence'] + bonus, 100)
        new_rarity = min(base['rarity'] + bonus, 100)
    
    # Arredondar para INTEGER (0-100)
    new_influence = int(round(new_influence))
    new_rarity = int(round(new_rarity))
    
    # Verificar se mudou
    changed_inf = abs(card['influence_score'] - new_influence) > 0.1
    changed_rar = abs(card['rarity_score'] - new_rarity) > 0.1
    
    if changed_inf or changed_rar:
        updates.append({
            'id': card['id'],
            'name': card['name'],
            'old_influence': card['influence_score'],
            'new_influence': new_influence,
            'old_rarity': card['rarity_score'],
            'new_rarity': new_rarity,
            'bonus': bonus
        })

print(f"📊 PREVIEW DAS MUDANÇAS ({len(updates)} cartas afetadas):\n")

# Mostrar exemplos por raridade
for rarity in ['trash', 'meme', 'viral', 'legendary']:
    rarity_updates = [u for u in updates if any(c['id'] == u['id'] and c['rarity'] == rarity for c in cards)][:3]
    
    if rarity_updates:
        print(f"🎴 {rarity.upper()}:")
        for u in rarity_updates:
            print(f"   {u['name'][:30]:30} | Bonus: +{u['bonus']:5.2f} | Influence: {u['old_influence']:5.1f} → {u['new_influence']:5.1f} | Rarity: {u['old_rarity']:5.1f} → {u['new_rarity']:5.1f}")
        print()

# Estatísticas de variação esperada
print("\n📈 IMPACTO ESPERADO:")
by_rarity = {}
for idx, card in enumerate(cards):
    rarity = card['rarity']
    if rarity not in by_rarity:
        by_rarity[rarity] = []
    
    bonus = calculate_semantic_bonus(card, idx)  # Passa índice aqui também
    base = RARITY_BASES.get(rarity, {'influence': 0})
    new_score = min(base['influence'] + bonus, 100)
    by_rarity[rarity].append(new_score)

for rarity in ['trash', 'meme', 'viral', 'legendary']:
    if rarity in by_rarity:
        scores = by_rarity[rarity]
        unique_scores = len(set(scores))
        total_scores = len(scores)
        print(f"   {rarity.upper():12} | Scores únicos: {unique_scores:3d}/{total_scores:3d} ({unique_scores/total_scores*100:5.1f}%)")

print("\n" + "="*80)
print("💡 APLICAR MUDANÇAS?")
print("="*80)
print("✅ Sim: python scripts/apply-score-changes.py")
print("❌ Não: Cancelar operação")
print("\nArquivo de backup será gerado antes de aplicar mudanças.")

# Salvar updates para próximo script
import json
with open('scripts/score_updates.json', 'w', encoding='utf-8') as f:
    json.dump(updates, f, indent=2, ensure_ascii=False)

print(f"\n💾 {len(updates)} mudanças salvas em score_updates.json")
