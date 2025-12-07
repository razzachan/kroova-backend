import requests

url = "https://mmcytphoeyxeylvaqjgr.supabase.co/rest/v1/booster_types?price_brl=eq.10.00"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"
headers = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

data = {"value_adjustment": 0.33}

response = requests.patch(url, headers=headers, json=data)

if response.status_code in [200, 204]:
    print("✓ Whale ajustado para 0.33!")
else:
    print(f"✗ Erro: {response.status_code}")
    print(response.text)
