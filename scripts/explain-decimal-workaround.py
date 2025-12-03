"""Alterar tipo de coluna via RPC ou migration alternativa"""
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

print("="*80)
print("⚠️  IMPORTANTE: Alteração de tipo de coluna via REST API não é suportada.")
print("="*80)
print("\n🔧 SOLUÇÃO ALTERNATIVA:")
print("\n1. As colunas são INTEGER mas precisamos DECIMAL para variação")
print("2. Como não podemos ALTER COLUMN via API, vamos:")
print("   - Manter INTEGER")
print("   - Multiplicar bônus por 10 no cálculo")
print("   - Dividir por 10 ao exibir")
print("\nExemplo:")
print("   Score calculado: 37.4 → Armazena: 374 (INT)")
print("   Frontend divide: 374 / 10 = 37.4")
print("\n✅ Isso permite 260 valores únicos por range ao invés de 26!")
print("\n" + "="*80)
print("💡 EXECUTAR:")
print("="*80)
print("1. python scripts/recalculate-scores-smart.py  # Recalcula com *10")
print("2. python scripts/apply-score-changes.py       # Aplica no banco")
print("3. Atualizar frontend para dividir por 10")
