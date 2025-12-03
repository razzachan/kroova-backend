"""Adicionar coluna pack_id via Supabase SQL API"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# SQL para executar
sql_commands = [
    "ALTER TABLE booster_types ADD COLUMN IF NOT EXISTS pack_id TEXT;",
    "CREATE INDEX IF NOT EXISTS idx_booster_types_pack_id ON booster_types(pack_id);",
    "COMMENT ON COLUMN booster_types.pack_id IS 'Identificador do pack (ED01_ALPHA, ED01_BETA, ED01_GAMMA)';"
]

print("=" * 80)
print("🔧 ADICIONANDO COLUNA pack_id")
print("=" * 80)

# Tentar via PostgREST RPC
for i, sql in enumerate(sql_commands, 1):
    print(f"\n[{i}/{len(sql_commands)}] {sql[:60]}...")
    
    # Usar endpoint /rpc para executar SQL bruto
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json'
        },
        json={'query': sql}
    )
    
    if response.status_code in [200, 201, 204]:
        print(f"   ✅ Executado")
    else:
        # Endpoint RPC pode não existir, vamos tentar outro método
        print(f"   ⚠️  RPC não disponível ({response.status_code})")
        print("\n" + "=" * 80)
        print("⚠️  EXECUTE MANUALMENTE NO SUPABASE DASHBOARD:")
        print("=" * 80)
        print("\n" + "\n".join(sql_commands))
        print("\n" + "=" * 80)
        print("Depois execute: python scripts\\execute-migration.py")
        break
