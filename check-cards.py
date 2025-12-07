import requests

# Config
user_id = "15f2efb3-f1e6-4146-b35c-41d93f32d569"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"
base_url = "https://mmcytphoeyxeylvaqjgr.supabase.co"

headers = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}"
}

print("\n=== SUAS ÚLTIMAS 20 CARTAS ===\n")

# Get cards
response = requests.get(
    f"{base_url}/rest/v1/cards_instances",
    headers=headers,
    params={
        "owner_id": f"eq.{user_id}",
        "select": "skin,liquidity_brl",
        "limit": 20
    }
)

if response.status_code == 200:
    cards = response.json()
    
    total_value = 0
    for i, card in enumerate(cards, 1):
        value = card['liquidity_brl']
        total_value += value
        print(f"{i}. {card['skin']:10} | R$ {value:.4f}")
    
    print(f"\n--- TOTAL DAS 20 CARTAS: R$ {total_value:.2f} ---")
    
    # Assumindo 4 boosters (20/5 = 4)
    if len(cards) >= 5:
        print("\n=== ANÁLISE POR BOOSTER (5 cartas cada) ===")
        for b in range(0, min(20, len(cards)), 5):
            booster_cards = cards[b:b+5]
            booster_value = sum(c['liquidity_brl'] for c in booster_cards)
            print(f"\nBooster {b//5 + 1}: R$ {booster_value:.2f}")
            for c in booster_cards:
                print(f"  {c['skin']:10} R$ {c['liquidity_brl']:.4f}")
    
else:
    print(f"Erro: {response.status_code}")
    print(response.text)
