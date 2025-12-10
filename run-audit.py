from supabase import create_client
import json

# Configuração
SUPABASE_URL = 'https://mmcytphoeyxeylvaqjgr.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw'

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def print_section(title):
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_table(data, columns=None):
    if not data:
        print("⚠️  Sem dados")
        return
    
    if columns is None:
        columns = list(data[0].keys())
    
    # Header
    header = " | ".join(f"{col:20}" for col in columns)
    print(header)
    print("-" * len(header))
    
    # Rows
    for row in data:
        values = [str(row.get(col, 'N/A'))[:20] for col in columns]
        print(" | ".join(f"{val:20}" for val in values))

print_section("AUDITORIA DE BOOSTERS - KROOVA")

# 1. CONTAGEM DE CARTAS POR RARIDADE
print_section("1. Contagem de Cartas por Raridade")
result = supabase.table('cards_base').select('rarity').execute()
rarities = {}
for card in result.data:
    rarity = card['rarity']
    rarities[rarity] = rarities.get(rarity, 0) + 1

total = sum(rarities.values())
print(f"{'Raridade':<15} {'Total':<10} {'%':<10}")
print("-" * 35)
for rarity in ['godmode', 'legendary', 'viral', 'meme', 'trash']:
    count = rarities.get(rarity, 0)
    pct = (count / total * 100) if total > 0 else 0
    print(f"{rarity:<15} {count:<10} {pct:<10.2f}%")

# 2. INSTÂNCIAS EM CIRCULAÇÃO
print_section("2. Instâncias em Circulação por Raridade")
result = supabase.table('cards_instances').select('base_id, owner_id').not_.is_('owner_id', 'null').execute()
instances = {}
for inst in result.data:
    base_id = inst['base_id']
    if base_id not in instances:
        instances[base_id] = 0
    instances[base_id] += 1

# Buscar raridades
base_rarities = {}
result = supabase.table('cards_base').select('id, rarity').execute()
for card in result.data:
    base_rarities[card['id']] = card['rarity']

rarity_counts = {}
for base_id, count in instances.items():
    rarity = base_rarities.get(base_id, 'unknown')
    rarity_counts[rarity] = rarity_counts.get(rarity, 0) + count

total_instances = sum(rarity_counts.values())
print(f"{'Raridade':<15} {'Instâncias':<15} {'%':<10}")
print("-" * 40)
for rarity in ['godmode', 'legendary', 'viral', 'meme', 'trash']:
    count = rarity_counts.get(rarity, 0)
    pct = (count / total_instances * 100) if total_instances > 0 else 0
    print(f"{rarity:<15} {count:<15} {pct:<10.2f}%")

# 3. CONFIGURAÇÃO DE BOOSTER_TYPES
print_section("3. Configuração de Booster Types")
result = supabase.table('booster_types').select('name, price_brl, cards_per_booster, guaranteed_cards').order('price_brl').execute()
if result.data:
    for bt in result.data:
        print(f"\n🎁 {bt['name']}")
        print(f"   Preço: R$ {bt.get('price_brl', 0):.2f}")
        print(f"   Cartas: {bt.get('cards_per_booster', 'N/A')}")
        print(f"   Garantidas: {bt.get('guaranteed_cards', 'N/A')}")

# 4. HISTÓRICO DE ABERTURAS (últimos 30 dias)
print_section("4. Histórico de Aberturas (30 dias)")
from datetime import datetime, timedelta
thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
result = supabase.table('booster_openings').select('booster_type_id, user_id').gte('opened_at', thirty_days_ago).execute()
if result.data:
    openings_by_type = {}
    users_by_type = {}
    for opening in result.data:
        bt_id = opening['booster_type_id']
        user_id = opening['user_id']
        
        openings_by_type[bt_id] = openings_by_type.get(bt_id, 0) + 1
        
        if bt_id not in users_by_type:
            users_by_type[bt_id] = set()
        users_by_type[bt_id].add(user_id)
    
    # Buscar nomes dos boosters
    booster_names = {}
    result2 = supabase.table('booster_types').select('id, name, price_brl').execute()
    for bt in result2.data:
        booster_names[bt['id']] = (bt['name'], bt.get('price_brl', 0))
    
    print(f"{'Booster':<20} {'Aberturas':<15} {'Usuários':<15} {'Receita':<15}")
    print("-" * 65)
    for bt_id, count in sorted(openings_by_type.items(), key=lambda x: x[1], reverse=True):
        name, price = booster_names.get(bt_id, ('Unknown', 0))
        users = len(users_by_type.get(bt_id, set()))
        revenue = count * price
        print(f"{name:<20} {count:<15} {users:<15} R$ {revenue:<12.2f}")
else:
    print("⚠️  Nenhuma abertura nos últimos 30 dias")

# 7. CARTAS GODMODE EM CIRCULAÇÃO
print_section("7. Cartas Godmode em Circulação (Top 10)")
result = supabase.table('cards_base').select('id, name, rarity, base_liquidity_brl').eq('rarity', 'godmode').execute()
godmode_cards = {}
for card in result.data:
    godmode_cards[card['id']] = {
        'name': card['name'],
        'value': card.get('base_liquidity_brl', 0),
        'count': 0
    }

result2 = supabase.table('cards_instances').select('base_id, owner_id').not_.is_('owner_id', 'null').execute()
for inst in result2.data:
    base_id = inst['base_id']
    if base_id in godmode_cards:
        godmode_cards[base_id]['count'] += 1

# Ordenar por quantidade
sorted_godmode = sorted(godmode_cards.items(), key=lambda x: x[1]['count'], reverse=True)[:10]

print(f"{'Card':<30} {'Instâncias':<15} {'Valor Base':<15}")
print("-" * 60)
for card_id, data in sorted_godmode:
    print(f"{data['name'][:28]:<30} {data['count']:<15} R$ {data['value']:<12.4f}")

# 12. ESTATÍSTICAS DAS TABELAS
print_section("12. Estatísticas das Tabelas")
tables = ['cards_base', 'booster_types', 'cards_instances', 'booster_openings']
print(f"{'Tabela':<25} {'Registros':<15}")
print("-" * 40)
for table in tables:
    result = supabase.table(table).select('id', count='exact').limit(1).execute()
    count = result.count if hasattr(result, 'count') else 'N/A'
    print(f"{table:<25} {count:<15}")

print("\n" + "=" * 80)
print("✅ Auditoria Concluída!")
print("=" * 80)
