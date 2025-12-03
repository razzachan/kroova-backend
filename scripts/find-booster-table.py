"""Verificar nome correto da tabela de boosters"""
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
print("🔍 VERIFICANDO TABELAS DE BOOSTERS")
print("=" * 80)

# Tentar várias possibilidades
table_names = [
    'booster_types',
    'booster_type',
    'boosters',
    'booster',
    'packs',
    'pack_types'
]

for table_name in table_names:
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table_name}",
        headers=headers,
        params={'select': 'id', 'limit': '1'}
    )
    
    if response.status_code == 200:
        print(f"✅ Tabela '{table_name}' EXISTE")
        
        # Buscar estrutura
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/{table_name}",
            headers=headers,
            params={'select': '*', 'limit': '1'}
        )
        
        if response.json():
            sample = response.json()[0]
            print(f"   Colunas: {list(sample.keys())}")
    elif response.status_code == 404:
        print(f"❌ Tabela '{table_name}' NÃO EXISTE")
    else:
        print(f"⚠️  '{table_name}': {response.status_code}")

print("\n" + "=" * 80)
