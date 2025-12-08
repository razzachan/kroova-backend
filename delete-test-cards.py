#!/usr/bin/env python3
"""Remove cartas de teste do inventário do usuário"""

import requests

# Configuração
SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTQyMjAsImV4cCI6MjA3OTY5MDIyMH0.i1bcSAGL_J-vxc6gxwXZZxfn7GJl8puL5eYwe9UkZAs"

USER_ID = "15f2efb3-f1e6-4146-b35c-41d93f32d569"

headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

print("\n" + "="*80)
print("🗑️  REMOVENDO CARTAS DE TESTE DO INVENTÁRIO")
print("="*80 + "\n")

# 1. Contar cartas
print("📊 Verificando total de cartas...")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/user_inventory",
    headers=headers,
    params={
        'user_id': f'eq.{USER_ID}',
        'select': 'id',
        'limit': 1
    }
)

if response.status_code != 200:
    print(f"❌ Erro ao buscar cartas: {response.status_code}")
    print(response.text)
    exit(1)

# Pegar total do header Content-Range
content_range = response.headers.get('Content-Range', '0-0/0')
total = int(content_range.split('/')[-1])

print(f"✅ Total de cartas encontradas: {total}")

if total == 0:
    print("✅ Nenhuma carta para remover!")
    exit(0)

# 2. Confirmar
print(f"\n⚠️  ATENÇÃO: Isso vai DELETAR {total} cartas do inventário!")
print(f"User ID: {USER_ID}")
confirm = input("\nDigite 'SIM' para confirmar: ")

if confirm != 'SIM':
    print("❌ Operação cancelada.")
    exit(0)

# 3. Deletar
print(f"\n🗑️  Deletando {total} cartas...")
response = requests.delete(
    f"{SUPABASE_URL}/rest/v1/user_inventory",
    headers=headers,
    params={'user_id': f'eq.{USER_ID}'}
)

if response.status_code in [200, 204]:
    print(f"✅ {total} cartas removidas com sucesso!")
else:
    print(f"❌ Erro ao deletar: {response.status_code}")
    print(response.text)
    exit(1)

print("\n" + "="*80)
print("✅ LIMPEZA CONCLUÍDA")
print("="*80 + "\n")
