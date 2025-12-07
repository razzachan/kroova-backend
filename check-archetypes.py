import requests
import json

# Supabase config
SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

# Query distinct archetypes
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/cards_base",
    headers=headers,
    params={"select": "archetype", "archetype": "not.is.null"}
)

if response.status_code == 200:
    cards = response.json()
    archetypes = set(card['archetype'] for card in cards if card.get('archetype'))
    
    print("\n=== ARCHETYPES ATUAIS ===")
    for arch in sorted(archetypes):
        count = sum(1 for c in cards if c.get('archetype') == arch)
        print(f"{arch:<20} ({count} cards)")
    
    print(f"\n\nTotal distinct: {len(archetypes)}")
    print(f"Total cards: {len(cards)}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
