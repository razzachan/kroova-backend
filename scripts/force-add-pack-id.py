#!/usr/bin/env python3
"""
ÚLTIMO RECURSO: Adicionar pack_id manualmente a cada booster existente
Isso força a criação da coluna implicitamente
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

print("=" * 80)
print("🔧 FORÇANDO CRIAÇÃO DA COLUNA pack_id")
print("=" * 80)

# Buscar todos os boosters
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={'select': '*', 'order': 'price_brl.asc'}
)

boosters = response.json()
print(f"\n📊 {len(boosters)} boosters encontrados")

# Tentar adicionar pack_id=NULL em um booster para forçar a criação da coluna
print("\n🔧 Tentando adicionar coluna via PATCH...")

if boosters:
    first_booster = boosters[0]
    
    try:
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/booster_types",
            headers=headers,
            params={'id': f'eq.{first_booster["id"]}'},
            json={'pack_id': 'TEST'}
        )
        
        if response.status_code in [200, 201, 204]:
            print("✅ Coluna pack_id adicionada via PATCH!")
            print("\n🔄 Removendo valor de teste...")
            
            # Remover o teste
            response = requests.patch(
                f"{SUPABASE_URL}/rest/v1/booster_types",
                headers=headers,
                params={'id': f'eq.{first_booster["id"]}'},
                json={'pack_id': None}
            )
            
            print("✅ Coluna pronta para uso")
            print("\n📝 Agora execute a migration 20241203_complete_migration.sql novamente")
            
        else:
            print(f"❌ Erro {response.status_code}: {response.text}")
            print("\n⚠️  A coluna precisa ser adicionada via SQL no Dashboard:")
            print("    ALTER TABLE booster_types ADD COLUMN pack_id TEXT;")
            
    except Exception as e:
        print(f"❌ Erro: {e}")
else:
    print("❌ Nenhum booster encontrado")

print("\n" + "=" * 80)
