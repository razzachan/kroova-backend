"""Verificar ambas implementações: Tiers por preço + Packs por tema"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

print("=" * 80)
print("🔍 VERIFICANDO IMPLEMENTAÇÃO 1: BOOSTERS POR PREÇO (TIER ECONÔMICO)")
print("=" * 80)

# Buscar boosters ordenados por preço
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={
        'select': '*',
        'edition_id': 'eq.ED01',
        'order': 'price_brl.asc'
    }
)

boosters = response.json()

print(f"\n📦 Total de boosters ED01: {len(boosters)}")
print("\n💰 BOOSTERS ORDENADOS POR PREÇO:")
print("-" * 80)

for b in boosters:
    rarity_dist = b.get('rarity_distribution', {})
    godmode = rarity_dist.get('godmode', 0)
    legendary = rarity_dist.get('legendary', 0)
    epica = rarity_dist.get('epica', 0)
    
    print(f"R$ {b['price_brl']:6.2f} | {b['name']:25} | "
          f"godmode:{godmode:4}% legendary:{legendary:4}% epica:{epica:4}%")

print("\n" + "=" * 80)
print("🔍 VERIFICANDO IMPLEMENTAÇÃO 2: PACKS POR TEMA (ALPHA/BETA/GAMMA)")
print("=" * 80)

# Verificar se existe coluna pack_id ou similar
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={'select': '*', 'limit': '1'}
)

if response.status_code == 200:
    sample = response.json()[0] if response.json() else {}
    print(f"\n📋 Colunas disponíveis: {list(sample.keys())}")
    
    # Verificar se tem pack_id
    if 'pack_id' in sample:
        print("\n✅ Coluna 'pack_id' EXISTE")
        
        # Contar por pack_id
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/booster_types",
            headers=headers,
            params={'select': 'pack_id,name,price_brl'}
        )
        
        boosters = response.json()
        packs = {}
        for b in boosters:
            pack = b.get('pack_id', 'N/A')
            if pack not in packs:
                packs[pack] = []
            packs[pack].append(b)
        
        print(f"\n🎴 PACKS ENCONTRADOS: {list(packs.keys())}")
        
        for pack_id, items in packs.items():
            print(f"\n{pack_id}:")
            for item in items:
                print(f"  - {item['name']} (R$ {item['price_brl']})")
    else:
        print("\n❌ Coluna 'pack_id' NÃO EXISTE")
        print("⚠️  Implementação 2 (packs por tema) NÃO foi implementada")

# Verificar se existe tabela pack_card_pools
print("\n" + "=" * 80)
print("🔍 VERIFICANDO TABELA pack_card_pools")
print("=" * 80)

response = requests.get(
    f"{SUPABASE_URL}/rest/v1/pack_card_pools",
    headers=headers,
    params={'select': 'pack_id', 'limit': '1'}
)

if response.status_code == 200:
    print("\n✅ Tabela 'pack_card_pools' EXISTE")
    
    # Contar cartas por pack
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/pack_card_pools",
        headers=headers,
        params={'select': 'pack_id'}
    )
    
    pools = response.json()
    pack_counts = {}
    for p in pools:
        pack = p['pack_id']
        pack_counts[pack] = pack_counts.get(pack, 0) + 1
    
    print(f"\n🎴 CARD POOLS POR PACK:")
    for pack, count in sorted(pack_counts.items()):
        print(f"  {pack}: {count} cartas")
        
elif response.status_code == 404:
    print("\n❌ Tabela 'pack_card_pools' NÃO EXISTE")
    print("⚠️  Sistema de card pools exclusivos NÃO foi implementado")
else:
    print(f"\n⚠️  Erro ao verificar: {response.status_code}")

print("\n" + "=" * 80)
print("📊 RESUMO DA IMPLEMENTAÇÃO")
print("=" * 80)
print()
