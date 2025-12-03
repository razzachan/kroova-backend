"""Verificar estrutura da tabela cards via API"""
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

# Testar diferentes nomes possíveis
table_names = ['cards_base', 'cards', 'card', 'Cards', 'CardsBase']

print("🔍 Testando nomes de tabelas...\n")

for table in table_names:
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=headers,
            params={'select': 'id', 'limit': '1'}
        )
        
        if response.status_code == 200:
            print(f"✅ Tabela encontrada: {table}")
            
            # Buscar detalhes de uma carta
            detail_response = requests.get(
                f"{SUPABASE_URL}/rest/v1/{table}",
                headers=headers,
                params={'select': '*', 'limit': '1'}
            )
            
            if detail_response.status_code == 200 and detail_response.json():
                card = detail_response.json()[0]
                print(f"   Colunas: {', '.join(card.keys())}")
                
                if 'influence_score' in card:
                    print(f"   influence_score tipo: {type(card['influence_score'])}")
                    print(f"   rarity_score tipo: {type(card['rarity_score'])}")
                    print(f"   Valor exemplo: {card['influence_score']}")
            break
        elif response.status_code == 404:
            print(f"❌ Não encontrada: {table}")
        else:
            print(f"⚠️  {table}: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Erro em {table}: {e}")

print("\n" + "="*60)
