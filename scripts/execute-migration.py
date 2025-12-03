"""Executar migration de correção do sistema de boosters"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

print("=" * 80)
print("🔧 EXECUTANDO MIGRATION: FIX BOOSTER SYSTEM")
print("=" * 80)

# Ler migration SQL
with open('supabase/migrations/20241203_fix_booster_system.sql', 'r', encoding='utf-8') as f:
    sql_content = f.read()

print("\n📝 Migration carregada (", len(sql_content), "bytes)")

# Executar via RPC (edge function ou direct SQL execution)
# Como Supabase REST API não suporta SQL direto, vamos executar parte por parte

print("\n" + "=" * 80)
print("PARTE 1: Corrigir Jackpot Hard Cap")
print("=" * 80)

response = requests.patch(
    f"{SUPABASE_URL}/rest/v1/edition_configs",
    headers=headers,
    params={'id': 'eq.ED01'},
    json={'jackpot_hard_cap': 500.00}
)

if response.status_code in [200, 204]:
    print("✅ Jackpot hard cap atualizado para R$ 500.00")
else:
    print(f"❌ Erro: {response.status_code} - {response.text}")
    exit(1)

print("\n" + "=" * 80)
print("PARTE 2: Verificar estrutura da tabela")
print("=" * 80)

# Buscar um booster para ver estrutura completa
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={'select': '*', 'limit': '1'}
)

if response.status_code == 200:
    sample = response.json()
    if sample:
        columns = list(sample[0].keys())
        print(f"✅ Colunas disponíveis: {columns}")
        
        if 'pack_id' in columns:
            print("✅ Coluna pack_id já existe")
        else:
            print("❌ Coluna pack_id NÃO existe")
            print("⚠️  Execute primeiro: ALTER TABLE booster_types ADD COLUMN pack_id TEXT;")
            exit(1)
    else:
        print("⚠️  Tabela vazia, continuando...")
else:
    print(f"❌ Erro ao verificar estrutura: {response.status_code}")
    exit(1)

print("\n" + "=" * 80)
print("PARTE 3: Limpar boosters obsoletos")
print("=" * 80)

# Buscar IDs dos boosters a deletar
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={'select': 'id,name,price_brl', 'edition_id': 'eq.ED01'}
)

boosters = response.json()
print(f"📦 {len(boosters)} boosters encontrados para deletar:")
for b in boosters:
    print(f"   - {b['name']} (R$ {b['price_brl']})")

# Deletar todos
response = requests.delete(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={'edition_id': 'eq.ED01'}
)

if response.status_code in [200, 204]:
    print(f"✅ {len(boosters)} boosters deletados")
else:
    print(f"❌ Erro ao deletar: {response.status_code} - {response.text}")
    exit(1)

print("\n" + "=" * 80)
print("PARTE 4: Criar 15 boosters (5 tiers × 3 packs)")
print("=" * 80)

def create_rarity_distribution(trash, meme, viral, legendary, epica, godmode):
    return {
        'trash': trash,
        'meme': meme,
        'viral': viral,
        'legendary': legendary,
        'epica': epica,
        'godmode': godmode
    }

# Configurações dos 5 tiers
tiers = [
    {
        'name': 'Básico',
        'price': 0.50,
        'multiplier': 1,
        'dist': create_rarity_distribution(60, 28, 8, 4, 0, 0.3)
    },
    {
        'name': 'Padrão',
        'price': 1.00,
        'multiplier': 2,
        'dist': create_rarity_distribution(55, 28, 12, 5, 0, 0.5)
    },
    {
        'name': 'Premium',
        'price': 2.00,
        'multiplier': 4,
        'dist': create_rarity_distribution(50, 27, 15, 7, 1, 0.7)
    },
    {
        'name': 'Elite',
        'price': 5.00,
        'multiplier': 10,
        'dist': create_rarity_distribution(40, 30, 18, 10, 2, 0.8)
    },
    {
        'name': 'Whale',
        'price': 10.00,
        'multiplier': 20,
        'dist': create_rarity_distribution(30, 30, 22, 15, 3, 1.0)
    }
]

packs = ['ED01_ALPHA', 'ED01_BETA', 'ED01_GAMMA']
pack_names = ['Alpha', 'Beta', 'Gamma']

boosters_to_create = []

for pack_id, pack_display in zip(packs, pack_names):
    for tier in tiers:
        booster = {
            'name': f"{tier['name']} {pack_display}",
            'edition_id': 'ED01',
            'pack_id': pack_id,
            'price_brl': tier['price'],
            'cards_per_booster': 5,
            'price_multiplier': tier['multiplier'],
            'rarity_distribution': tier['dist']
        }
        boosters_to_create.append(booster)
        print(f"   Preparando: {booster['name']} (R$ {booster['price_brl']})")

# Criar todos de uma vez
response = requests.post(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    json=boosters_to_create
)

if response.status_code in [200, 201]:
    created = response.json()
    print(f"\n✅ {len(created)} boosters criados com sucesso")
else:
    print(f"❌ Erro ao criar boosters: {response.status_code} - {response.text}")
    exit(1)

print("\n" + "=" * 80)
print("PARTE 5: Criar tabela raspadinhas")
print("=" * 80)

print("⚠️  NECESSÁRIO EXECUTAR SQL MANUALMENTE:")
print("""
CREATE TABLE IF NOT EXISTS raspadinhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booster_type_id UUID NOT NULL REFERENCES booster_types(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  multiplier INTEGER NOT NULL,
  probability NUMERIC(12,10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_booster_tier UNIQUE(booster_type_id, tier)
);

CREATE INDEX IF NOT EXISTS idx_raspadinhas_booster_type 
ON raspadinhas(booster_type_id);
""")

print("\n" + "=" * 80)
print("✅ MIGRATION PARCIALMENTE COMPLETA")
print("=" * 80)
print("\n⚠️  AÇÕES MANUAIS NECESSÁRIAS:")
print("1. Executar ALTER TABLE para adicionar pack_id (se ainda não existe)")
print("2. Executar CREATE TABLE raspadinhas no Supabase Dashboard")
print("3. Popular raspadinhas com configurações de jackpot")
print("\nApós completar, validar com: python scripts/verify-system-final.py")
