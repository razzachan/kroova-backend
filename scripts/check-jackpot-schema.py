#!/usr/bin/env python3
"""Check jackpot schema"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}'
}

response = requests.get(
    f"{SUPABASE_URL}/rest/v1/raspadinhas",
    headers=headers,
    params={'select': '*', 'limit': '1'}
)

print("Schema da tabela raspadinhas:")
print(response.json())
