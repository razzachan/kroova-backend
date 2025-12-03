"""Verificar duplicação de scores"""
import os
import requests
from dotenv import load_dotenv
from collections import Counter

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
        'select': 'name,rarity,influence_score,rarity_score',
        'edition_id': 'eq.ED01',
        'limit': '1000'
    }
)

cards = response.json()

print("=" * 80)
print("🔍 ANÁLISE DE DUPLICAÇÃO DE SCORES")
print("=" * 80)

# Contar duplicatas de rarity_score
rarity_scores = [c['rarity_score'] for c in cards if c['rarity_score']]
rarity_counter = Counter(rarity_scores)

print(f"\n📊 RARITY SCORE - Duplicatas:")
print(f"   Total de scores únicos: {len(rarity_counter)}")
print(f"   Total de cartas: {len(rarity_scores)}")

duplicates = {score: count for score, count in rarity_counter.items() if count > 1}
print(f"\n⚠️  Scores com duplicatas ({len(duplicates)}):")

for score in sorted(duplicates.keys()):
    count = duplicates[score]
    if count > 5:  # Mostrar só os mais problemáticos
        examples = [c['name'][:30] for c in cards if c['rarity_score'] == score][:3]
        print(f"   {score}: {count} cartas - Ex: {', '.join(examples)}")

# Verificar por raridade
print(f"\n📊 DUPLICAÇÃO POR RARIDADE:")
by_rarity = {}
for c in cards:
    rarity = c['rarity']
    if rarity not in by_rarity:
        by_rarity[rarity] = []
    if c['rarity_score']:
        by_rarity[rarity].append(c['rarity_score'])

for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
    if rarity not in by_rarity:
        continue
    
    scores = by_rarity[rarity]
    counter = Counter(scores)
    uniques = len(counter)
    total = len(scores)
    
    print(f"\n   {rarity.upper()}:")
    print(f"      Total cartas: {total}")
    print(f"      Scores únicos: {uniques}")
    print(f"      Taxa duplicação: {((total-uniques)/total*100):.1f}%")
    
    # Mostrar scores mais duplicados dessa raridade
    most_common = counter.most_common(5)
    if any(count > 1 for score, count in most_common):
        print(f"      Mais duplicados:")
        for score, count in most_common:
            if count > 1:
                print(f"         Score {score}: {count} cartas")

# Contar duplicatas de influence_score
print(f"\n" + "=" * 80)
print(f"📊 INFLUENCE SCORE - Duplicatas:")
influence_scores = [c['influence_score'] for c in cards if c['influence_score']]
influence_counter = Counter(influence_scores)

print(f"   Total de scores únicos: {len(influence_counter)}")
print(f"   Total de cartas: {len(influence_scores)}")

inf_duplicates = {score: count for score, count in influence_counter.items() if count > 5}
if inf_duplicates:
    print(f"\n⚠️  Scores com muitas duplicatas (>5):")
    for score in sorted(inf_duplicates.keys()):
        count = inf_duplicates[score]
        print(f"   {score}: {count} cartas")

print("\n" + "=" * 80)
print("💡 RECOMENDAÇÃO:")
print("=" * 80)

# Calcular ideal
ideal_unique_ratio = 0.7  # 70% de scores únicos é bom
current_rarity_ratio = len(rarity_counter) / len(rarity_scores)
current_influence_ratio = len(influence_counter) / len(influence_scores)

print(f"\nRarity Score:")
print(f"   Atual: {current_rarity_ratio*100:.1f}% únicos")
if current_rarity_ratio < ideal_unique_ratio:
    print(f"   ❌ Abaixo do ideal ({ideal_unique_ratio*100:.0f}%)")
    print(f"   💡 Sugestão: Adicionar variação baseada em nome/descrição")
else:
    print(f"   ✅ Acima do ideal")

print(f"\nInfluence Score:")
print(f"   Atual: {current_influence_ratio*100:.1f}% únicos")
if current_influence_ratio < ideal_unique_ratio:
    print(f"   ❌ Abaixo do ideal ({ideal_unique_ratio*100:.0f}%)")
    print(f"   💡 Sugestão: Ajustar algoritmo de cálculo")
else:
    print(f"   ✅ Acima do ideal")
