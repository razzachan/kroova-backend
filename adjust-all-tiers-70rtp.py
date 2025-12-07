import requests

base_url = "https://mmcytphoeyxeylvaqjgr.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

headers = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# RTP atual ~40%, target 70% → multiplicador = 70/40 = 1.75
# Aplicar 1.75x em todos os value_adjustments

adjustments = {
    0.50: 0.75 * 1.75,   # Básico: 0.75 → 1.31
    1.00: 0.73 * 1.75,   # Padrão: 0.73 → 1.28
    2.00: 0.25 * 1.75,   # Premium: 0.25 → 0.44
    5.00: 0.10 * 1.75,   # Elite: 0.10 → 0.18
    10.00: 0.33 * 1.75   # Whale: 0.33 → 0.58
}

tier_names = {
    0.50: "Básico",
    1.00: "Padrão", 
    2.00: "Premium",
    5.00: "Elite",
    10.00: "Whale"
}

print("\n🎯 AJUSTANDO TODOS OS TIERS PARA RTP ~70%")
print("=" * 60)

for price, new_value in adjustments.items():
    # Arredondar para 2 casas decimais
    new_value = round(new_value, 2)
    
    url = f"{base_url}/rest/v1/booster_types?price_brl=eq.{price}"
    response = requests.patch(url, headers=headers, json={"value_adjustment": new_value})
    
    if response.status_code in [200, 204]:
        print(f"✓ {tier_names[price]:<10} (R$ {price:>5.2f}): {new_value:.2f}")
    else:
        print(f"✗ {tier_names[price]:<10} ERRO: {response.status_code}")
        print(f"  {response.text}")

print("=" * 60)
print("\n✅ AJUSTE CONCLUÍDO! Multiplicador 1.75x aplicado (40% → 70%)")
