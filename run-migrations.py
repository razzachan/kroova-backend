import requests
import time
import os

SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

# Configurar PostgreSQL connection string
DB_URL = "postgresql://postgres.mmcytphoeyxeylvaqjgr:Akroma123*@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

def run_sql_file(filename):
    """Executar arquivo SQL via psql"""
    print(f"\n{'='*80}")
    print(f"📄 Executando: {filename}")
    print('='*80)
    
    filepath = f"migrations/{filename}"
    
    if not os.path.exists(filepath):
        print(f"❌ Arquivo não encontrado: {filepath}")
        return False
    
    # Ler conteúdo do arquivo
    with open(filepath, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Tentar executar via REST API do Supabase (só funciona para queries simples)
    # Para migrations complexas, usuário precisa executar manualmente no SQL Editor
    print(f"\n⚠️  ATENÇÃO: Migrations SQL devem ser executadas MANUALMENTE no Supabase SQL Editor")
    print(f"\nConteúdo de {filename}:")
    print("-"*80)
    print(sql_content[:500] + "..." if len(sql_content) > 500 else sql_content)
    print("-"*80)
    
    response = input(f"\n✅ Confirma que executou {filename} no Supabase? (s/n): ")
    return response.lower() == 's'

def main():
    print("\n" + "="*80)
    print("🚀 EXECUTANDO MIGRATIONS DO NOVO SISTEMA KROOVA")
    print("="*80)
    
    migrations = [
        "001_add_sub_rarity_columns.sql",
        "002_classify_sub_rarities.sql",
        "003_classify_pack_archetypes.sql",
        "004_create_treatment_tables.sql",
        "005_create_15_booster_types.sql"
    ]
    
    print("\n⚠️  INSTRUÇÕES:")
    print("1. Abra o Supabase SQL Editor: https://supabase.com/dashboard/project/mmcytphoeyxeylvaqjgr/editor")
    print("2. Execute cada script SQL NA ORDEM mostrada abaixo")
    print("3. Confirme aqui após executar cada um")
    print("\n")
    
    for i, migration in enumerate(migrations, 1):
        print(f"\n{'='*80}")
        print(f"📋 MIGRATION {i}/5: {migration}")
        print('='*80)
        
        # Mostrar conteúdo
        filepath = f"migrations/{migration}"
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            print("\n📝 Copie e cole este SQL no Supabase SQL Editor:")
            print("-"*80)
            print(content)
            print("-"*80)
        
        # Aguardar confirmação
        while True:
            response = input(f"\n✅ Executou {migration} no Supabase? (s/n/q para sair): ").lower()
            if response == 's':
                print(f"✅ {migration} confirmada!")
                break
            elif response == 'q':
                print("\n❌ Migrations interrompidas pelo usuário")
                return
            else:
                print("⚠️  Por favor, execute a migration no Supabase antes de continuar")
    
    print("\n" + "="*80)
    print("✅ TODAS AS MIGRATIONS CONCLUÍDAS!")
    print("="*80)
    print("\n🧪 Próximo passo: Rodar simulação de RTP")
    print("   Comando: python test-new-rtp-system.py")
    print("\n")

if __name__ == "__main__":
    main()
