import requests

url = "https://mmcytphoeyxeylvaqjgr.supabase.co/rest/v1/booster_types?price_brl=eq.10.00&select=*"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"
headers = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}"
}

response = requests.get(url, headers=headers)
if response.status_code == 200:
    data = response.json()
    for tier in data:
        print(f"\n{tier['name']} (R$ {tier['price_brl']}):")
        print(f"  godmode: {tier.get('godmode', 'N/A')}%")
        print(f"  value_adjustment: {tier['value_adjustment']}")
        print(f"\nTodos os campos:")
        for key, value in tier.items():
            print(f"  {key}: {value}")
else:
    print(f"Erro: {response.status_code}")
    print(response.text)
