"""Verificar constraints da tabela cards_base"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Não há endpoint REST para constraints
# Vou testar com valor 100 primeiro

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

print("🔍 Testando limites de score...")

# Buscar uma carta
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/cards_base",
    headers=headers,
    params={'select': 'id,influence_score,rarity_score', 'limit': '1'}
)

if response.status_code == 200 and response.json():
    card_id = response.json()[0]['id']
    
    # Testar valores
    test_values = [75, 100, 150, 200, 300, 500, 750]
    
    for val in test_values:
        test_response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/cards_base",
            headers=headers,
            params={'id': f'eq.{card_id}'},
            json={'influence_score': val}
        )
        
        if test_response.status_code in [200, 204]:
            print(f"✅ {val}: ACEITO")
        else:
            print(f"❌ {val}: REJEITADO")
            if 'check' in test_response.text.lower():
                print(f"   Constraint detectada!")
            break
