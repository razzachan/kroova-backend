from supabase import create_client

# Configuração
SUPABASE_URL = 'https://mmcytphoeyxeylvaqjgr.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw'

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 80)
print("SCHEMA DAS TABELAS")
print("=" * 80)

# Query simplificada que funciona
query = """
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('booster_types', 'cards_base', 'booster_openings', 'cards_instances', 'marketplace')
ORDER BY table_name, ordinal_position;
"""

try:
    # Executar query direto no postgrest
    result = supabase.table('information_schema.columns').select('*').execute()
    print("❌ Método 1 falhou, tentando método 2...")
except:
    pass

# Método alternativo: usar httpx diretamente
import httpx

url = f"{SUPABASE_URL}/rest/v1/rpc/exec"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

# Como não temos função RPC, vamos buscar dados diretamente das tabelas
tables_to_check = ['booster_types', 'cards_base', 'booster_openings', 'cards_instances', 'marketplace']

for table in tables_to_check:
    print(f"\n📋 Tabela: {table}")
    print("-" * 80)
    
    try:
        # Tentar pegar pelo menos 1 registro para ver as colunas
        result = supabase.table(table).select('*').limit(1).execute()
        
        if result.data and len(result.data) > 0:
            columns = list(result.data[0].keys())
            print(f"✅ Colunas encontradas: {len(columns)}")
            for col in columns:
                print(f"  - {col}")
        else:
            print("⚠️  Tabela vazia, não foi possível determinar colunas")
            
    except Exception as e:
        print(f"❌ Erro ao acessar tabela: {e}")

print("\n" + "=" * 80)
print("✅ Concluído!")
print("=" * 80)
