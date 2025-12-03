"""Analisar distribuição atual de influence_score e rarity_score"""
import os
import requests
from dotenv import load_dotenv
import statistics

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

print("=" * 80)
print("📊 ANÁLISE DE SCORES - COMPETITIVIDADE SUPER TRUNFO")
print("=" * 80)

# Buscar todas as cartas ED01
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/cards_base",
    headers=headers,
    params={
        'select': 'name,rarity,influence_score,rarity_score',
        'edition_id': 'eq.ED01',
        'order': 'influence_score.desc.nullslast',
        'limit': '1000'
    }
)

if response.status_code != 200:
    print(f"❌ Erro: {response.status_code}")
    exit(1)

cards = response.json()
print(f"\n📦 Total: {len(cards)} cartas")

# Agrupar por raridade
by_rarity = {}
for c in cards:
    rarity = c['rarity']
    if rarity not in by_rarity:
        by_rarity[rarity] = {'influence': [], 'rarity': []}
    
    if c['influence_score']:
        by_rarity[rarity]['influence'].append(c['influence_score'])
    if c['rarity_score']:
        by_rarity[rarity]['rarity'].append(c['rarity_score'])

print("\n" + "=" * 80)
print("📊 DISTRIBUIÇÃO POR RARIDADE")
print("=" * 80)

for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
    if rarity not in by_rarity or not by_rarity[rarity]['influence']:
        continue
    
    inf = by_rarity[rarity]['influence']
    rar = by_rarity[rarity]['rarity']
    
    print(f"\n🎴 {rarity.upper()} ({len(inf)} cartas):")
    print(f"   Influence Score:")
    print(f"      Range: {min(inf):.1f} - {max(inf):.1f}")
    print(f"      Média: {statistics.mean(inf):.1f}")
    print(f"      StdDev: {statistics.stdev(inf) if len(inf) > 1 else 0:.1f}")
    
    if rar:
        print(f"   Rarity Score:")
        print(f"      Range: {min(rar):.1f} - {max(rar):.1f}")
        print(f"      Média: {statistics.mean(rar):.1f}")
        print(f"      StdDev: {statistics.stdev(rar) if len(rar) > 1 else 0:.1f}")

# Verificar overlap entre raridades
print("\n" + "=" * 80)
print("⚠️  ANÁLISE DE COMPETITIVIDADE")
print("=" * 80)

all_influence = [c['influence_score'] for c in cards if c['influence_score']]
all_rarity = [c['rarity_score'] for c in cards if c['rarity_score']]

print(f"\n📊 INFLUENCE SCORE GLOBAL:")
print(f"   Range: {min(all_influence):.1f} - {max(all_influence):.1f}")
print(f"   Spread: {max(all_influence) - min(all_influence):.1f} pontos")

print(f"\n📊 RARITY SCORE GLOBAL:")
print(f"   Range: {min(all_rarity):.1f} - {max(all_rarity):.1f}")
print(f"   Spread: {max(all_rarity) - min(all_rarity):.1f} pontos")

# Verificar clusterização
print(f"\n⚠️  CLUSTERIZAÇÃO:")
inf_std = statistics.stdev(all_influence)
rar_std = statistics.stdev(all_rarity)

print(f"   Influence StdDev: {inf_std:.1f}")
if inf_std < 10:
    print(f"   ❌ Muito clusterizado! (esperado > 10)")
else:
    print(f"   ✅ Boa variação")

print(f"   Rarity StdDev: {rar_std:.1f}")
if rar_std < 10:
    print(f"   ❌ Muito clusterizado! (esperado > 10)")
else:
    print(f"   ✅ Boa variação")

# Amostra de top/bottom
print(f"\n🏆 TOP 5 INFLUENCE:")
for c in cards[:5]:
    print(f"   {c['influence_score']:5.1f} - {c['name'][:40]} ({c['rarity']})")

print(f"\n🔻 BOTTOM 5 INFLUENCE:")
for c in sorted(cards, key=lambda x: x['influence_score'] or 0)[:5]:
    print(f"   {c['influence_score']:5.1f} - {c['name'][:40]} ({c['rarity']})")

print("\n" + "=" * 80)
