import requests
import json
from collections import defaultdict

SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}"
}

# Get all cards
r = requests.get(f"{SUPABASE_URL}/rest/v1/cards_base", headers=headers, params={"select": "*"})
cards = r.json()

print("="*80)
print("🔍 KROOVA CARDS_BASE - AUDITORIA PROFUNDA")
print("="*80)

# 1. STRUCTURE
print("\n📊 1. ESTRUTURA DA TABELA")
print(f"Total de cartas: {len(cards)}")
if cards:
    print(f"Colunas: {', '.join(cards[0].keys())}")

# 2. RARITIES ANALYSIS
print("\n🎲 2. ANÁLISE DE RARIDADES")
rarities = defaultdict(lambda: {"count": 0, "liq_values": []})
for c in cards:
    r = c['rarity']
    rarities[r]["count"] += 1
    rarities[r]["liq_values"].append(float(c['base_liquidity_brl']))

for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
    if rarity in rarities:
        vals = rarities[rarity]["liq_values"]
        print(f"\n{rarity.upper()}: {rarities[rarity]['count']} cartas")
        print(f"  Liquidez: R$ {min(vals):.2f} - R$ {max(vals):.2f} (média: R$ {sum(vals)/len(vals):.2f})")
        print(f"  Distribuição: {len([v for v in vals if v < 0.05])} baixas | {len([v for v in vals if 0.05 <= v < 0.50])} médias | {len([v for v in vals if v >= 0.50])} altas")

# 3. ARCHETYPES
print("\n🧬 3. ARQUÉTIPOS EXISTENTES")
archetypes = defaultdict(lambda: {"count": 0, "rarities": defaultdict(int)})
for c in cards:
    arch = c.get('archetype')
    if arch:
        archetypes[arch]["count"] += 1
        archetypes[arch]["rarities"][c['rarity']] += 1

for arch in sorted(archetypes.keys()):
    print(f"{arch}: {archetypes[arch]['count']} cartas - {dict(archetypes[arch]['rarities'])}")

# 4. METADATA ANALYSIS
print("\n📦 4. METADADOS E CAMPOS EXTRAS")
sample_metadata = [c.get('metadata') for c in cards[:10] if c.get('metadata')]
print(f"Cartas com metadata: {len([c for c in cards if c.get('metadata')])}")
if sample_metadata:
    print(f"Exemplo de metadata: {json.dumps(sample_metadata[0], indent=2)}")

print(f"\nCartas com influence_score: {len([c for c in cards if c.get('influence_score')])}")
print(f"Cartas com rarity_score: {len([c for c in cards if c.get('rarity_score')])}")
print(f"Cartas com fixed_liquidity_brl: {len([c for c in cards if c.get('fixed_liquidity_brl')])}")
print(f"Cartas com pack_id: {len([c for c in cards if c.get('pack_id')])}")
print(f"Cartas shared: {len([c for c in cards if c.get('is_shared')])}")
print(f"Cartas pack_exclusive: {len([c for c in cards if c.get('pack_exclusive')])}")

# 5. MARKET TIERS
print("\n💰 5. MARKET TIERS")
market_tiers = defaultdict(int)
for c in cards:
    tier = c.get('market_tier')
    if tier:
        market_tiers[tier] += 1
print(f"Cartas com market_tier: {dict(market_tiers)}")

# 6. PROBLEMAS IDENTIFICADOS
print("\n⚠️ 6. PROBLEMAS IDENTIFICADOS")
issues = []

# Legendary com liquidity muito baixa
low_legendary = [c for c in cards if c['rarity'] == 'legendary' and float(c['base_liquidity_brl']) < 0.50]
if low_legendary:
    issues.append(f"❌ {len(low_legendary)} legendary com liquidez < R$ 0.50")
    for c in low_legendary[:3]:
        print(f"   - {c['name']}: R$ {c['base_liquidity_brl']}")

# Viral muito caras
expensive_viral = [c for c in cards if c['rarity'] == 'viral' and float(c['base_liquidity_brl']) > 1.0]
if expensive_viral:
    issues.append(f"⚠️ {len(expensive_viral)} viral com liquidez > R$ 1.00")

# Cartas sem archetype
no_arch = [c for c in cards if not c.get('archetype')]
if no_arch:
    issues.append(f"⚠️ {len(no_arch)} cartas sem archetype")

# Redundâncias
names = [c['name'] for c in cards]
duplicates = [n for n in set(names) if names.count(n) > 1]
if duplicates:
    issues.append(f"❌ {len(duplicates)} nomes duplicados")

print(f"\nTotal de issues: {len(issues)}")

# 7. SAMPLE CARDS
print("\n🃏 7. AMOSTRA DE CARTAS POR RARIDADE")
for rarity in ['trash', 'meme', 'viral', 'legendary', 'godmode']:
    sample = [c for c in cards if c['rarity'] == rarity][:2]
    print(f"\n{rarity.upper()}:")
    for c in sample:
        print(f"  {c['name']} - R$ {c['base_liquidity_brl']} - {c.get('archetype', 'N/A')}")
        if c.get('description'):
            print(f"    {c['description'][:80]}...")

print("\n" + "="*80)
