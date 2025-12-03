import os
from dotenv import load_dotenv
import requests

load_dotenv()

url = f"{os.getenv('NEXT_PUBLIC_SUPABASE_URL')}/rest/v1/cards_base"
headers = {
    'apikey': os.getenv('SUPABASE_SERVICE_ROLE_KEY'),
    'Authorization': f"Bearer {os.getenv('SUPABASE_SERVICE_ROLE_KEY')}",
    'Prefer': 'count=exact'
}
params = {
    'select': 'count',
    'edition_id': 'eq.ED01'
}

response = requests.get(url, headers=headers, params=params)
count = response.headers.get('content-range', '').split('/')[-1]
print(f"Total ED01 cards: {count}")
