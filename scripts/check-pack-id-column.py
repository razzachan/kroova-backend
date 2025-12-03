"""Verificar se pack_id existe e reexecutar inserts"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

# Verificar estrutura
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={'select': '*', 'limit': '1'}
)

if response.json():
    print("✅ Estrutura da tabela:")
    print(f"   Colunas: {', '.join(response.json()[0].keys())}\n")
    
    if 'pack_id' in response.json()[0]:
        print("✅ Coluna pack_id existe!")
    else:
        print("❌ Coluna pack_id NÃO existe - precisa executar migration de adicionar coluna")
else:
    print("⚠️  Nenhum booster encontrado (tabela vazia após DELETE)")

# Contar boosters atuais
count_headers = {**headers, 'Prefer': 'count=exact'}
count_response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=count_headers,
    params={'select': 'count', 'edition_id': 'eq.ED01'}
)

print(f"\n📊 Total de boosters ED01: {count_response.headers.get('Content-Range', 'unknown')}")
