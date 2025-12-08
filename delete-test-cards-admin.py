#!/usr/bin/env python3
"""Remove cartas de teste do inventário do usuário - COM SERVICE ROLE"""

import requests

# Configuração - PROJETO ATUAL
SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

USER_ID = "15f2efb3-f1e6-4146-b35c-41d93f32d569"

headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

print("\n" + "="*80)
print("🗑️  REMOVENDO CARTAS DE TESTE DO INVENTÁRIO E MARKETPLACE")
print("="*80 + "\n")

# 1. Verificar market_listings
print("📊 Verificando market_listings...")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/market_listings",
    headers=headers,
    params={
        'seller_id': f'eq.{USER_ID}',
        'select': 'id,card_instance_id,status,price_brl'
    }
)

if response.status_code != 200:
    print(f"❌ Erro ao buscar listings: {response.status_code}")
    print(response.text)
else:
    listings = response.json()
    print(f"✅ Listings no marketplace: {len(listings)}")
    if listings:
        print(f"   Primeiras 5: {listings[:5]}")

# 2. Verificar user_inventory
print("\n📊 Verificando user_inventory...")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/user_inventory",
    headers=headers,
    params={
        'user_id': f'eq.{USER_ID}',
        'select': 'card_instance_id'
    }
)

if response.status_code != 200:
    print(f"❌ Erro ao buscar inventory: {response.status_code}")
    print(response.text)
    exit(1)

inventory_cards = response.json()
inventory_total = len(inventory_cards)

print(f"✅ Cartas no inventário: {inventory_total}")

# 3. Verificar cards_instances
print("\n📊 Verificando cards_instances...")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/cards_instances",
    headers=headers,
    params={
        'owner_id': f'eq.{USER_ID}',
        'select': 'id'
    }
)

if response.status_code != 200:
    print(f"❌ Erro ao buscar instances: {response.status_code}")
    print(response.text)
else:
    instances = response.json()
    print(f"✅ Card instances: {len(instances)}")
    if instances:
        print(f"   Primeiras 3: {instances[:3]}")

listings_count = len(listings) if 'listings' in locals() else 0
instances_count = len(instances) if 'instances' in locals() else 0
total = inventory_total + listings_count + instances_count

print(f"\n📊 TOTAL:")
print(f"   - Market listings: {listings_count}")
print(f"   - User inventory: {inventory_total}")
print(f"   - Card instances: {instances_count}")
print(f"   - TOTAL: {total}")

if total == 0:
    print("\n✅ Nenhuma carta para remover!")
    exit(0)

# 4. Confirmar
print(f"\n⚠️  ATENÇÃO: Isso vai DELETAR TUDO!")
print(f"   - Market listings: {len(listings) if 'listings' in locals() else 0}")
print(f"   - User inventory: {inventory_total}")
print(f"   - Card instances: {len(instances) if 'instances' in locals() else 0}")
print(f"User ID: {USER_ID}")
confirm = input("\nDigite 'SIM' para confirmar: ")

if confirm != 'SIM':
    print("❌ Operação cancelada.")
    exit(0)

# 5. Deletar market_listings
if 'listings' in locals() and len(listings) > 0:
    print(f"\n🗑️  Deletando {len(listings)} market listings...")
    response = requests.delete(
        f"{SUPABASE_URL}/rest/v1/market_listings",
        headers=headers,
        params={'seller_id': f'eq.{USER_ID}'}
    )
    if response.status_code in [200, 204]:
        print(f"✅ Market listings removidos!")
    else:
        print(f"❌ Erro ao deletar listings: {response.status_code}")
        print(response.text)

# 6. Deletar user_inventory
if inventory_total > 0:
    print(f"\n🗑️  Deletando {inventory_total} do inventário...")
    response = requests.delete(
        f"{SUPABASE_URL}/rest/v1/user_inventory",
        headers=headers,
        params={'user_id': f'eq.{USER_ID}'}
    )
    if response.status_code in [200, 204]:
        print(f"✅ Inventário limpo!")
    else:
        print(f"❌ Erro ao deletar inventory: {response.status_code}")
        print(response.text)

# 7. Deletar cards_instances
if 'instances' in locals() and len(instances) > 0:
    print(f"\n🗑️  Deletando {len(instances)} card instances...")
    response = requests.delete(
        f"{SUPABASE_URL}/rest/v1/cards_instances",
        headers=headers,
        params={'owner_id': f'eq.{USER_ID}'}
    )
    if response.status_code in [200, 204]:
        print(f"✅ Card instances removidos!")
    else:
        print(f"❌ Erro ao deletar instances: {response.status_code}")
        print(response.text)

print("\n" + "="*80)
print("✅ LIMPEZA CONCLUÍDA")
print("="*80 + "\n")
