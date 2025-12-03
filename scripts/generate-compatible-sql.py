"""Gerar SQL correto baseado no que existe no Supabase"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Extrair project_id da URL
project_id = SUPABASE_URL.split('//')[1].split('.')[0]

print("=" * 80)
print("🔍 GERANDO SQL COMPATÍVEL COM SUPABASE")
print("=" * 80)
print(f"\nProject ID: {project_id}")
print(f"Supabase URL: {SUPABASE_URL}")

# A tabela existe via API, então deve estar em um schema acessível
# Supabase usa schema padrão dependendo da configuração

print("\n📝 SQL CORRETO PARA EXECUTAR:\n")
print("=" * 80)

sql = """
-- Descobrir onde está a tabela booster_types
DO $$ 
DECLARE
    schema_name text;
    table_exists boolean;
BEGIN
    -- Tentar encontrar a tabela em qualquer schema
    SELECT n.nspname INTO schema_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'booster_types'
    LIMIT 1;
    
    IF schema_name IS NOT NULL THEN
        RAISE NOTICE 'Tabela booster_types encontrada no schema: %', schema_name;
        
        -- Verificar se coluna pack_id já existe
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = schema_name 
            AND table_name = 'booster_types' 
            AND column_name = 'pack_id'
        ) INTO table_exists;
        
        IF table_exists THEN
            RAISE NOTICE 'Coluna pack_id já existe!';
        ELSE
            -- Adicionar coluna usando schema dinâmico
            EXECUTE format('ALTER TABLE %I.booster_types ADD COLUMN pack_id TEXT', schema_name);
            EXECUTE format('CREATE INDEX idx_booster_types_pack_id ON %I.booster_types(pack_id)', schema_name);
            RAISE NOTICE 'Coluna pack_id adicionada com sucesso!';
        END IF;
    ELSE
        RAISE EXCEPTION 'Tabela booster_types não encontrada em nenhum schema!';
    END IF;
END $$;

-- Verificar resultado
SELECT table_schema, table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'booster_types' AND column_name = 'pack_id';
"""

print(sql)
print("=" * 80)

# Salvar em arquivo
output_file = 'supabase/migrations/20241203_01_add_pack_id_v2.sql'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(sql)

print(f"\n✅ SQL salvo em: {output_file}")
print("\nCopie e execute este SQL no Supabase Dashboard > SQL Editor")
