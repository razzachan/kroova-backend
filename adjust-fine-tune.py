import requests

base_url = "https://mmcytphoeyxeylvaqjgr.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

headers = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Últimos resultados - apenas ajustar os que precisam
adjustments = {
    0.50: (2.54, 83.1, 70 / 83.1),   # Básico: 2.54 * 0.84 = 2.14
    1.00: (3.04, 96.8, 70 / 96.8),   # Padrão: 3.04 * 0.72 = 2.19
    2.00: (0.96, 99.9, 70 / 99.9),   # Premium: 0.96 * 0.70 = 0.67
    5.00: (0.28, 46.9, 70 / 46.9),   # Elite: 0.28 * 1.49 = 0.42
    10.00: (0.40, 71.5, 1.0)         # Whale: 0.40 (JÁ OK!)
}

tier_names = {
    0.50: "Básico",
    1.00: "Padrão",
    2.00: "Premium",
    5.00: "Elite",
    10.00: "Whale"
}

print("\n🎯 AJUSTE FINO FINAL")
print("=" * 70)

for price, (current_val, current_rtp, multiplier) in adjustments.items():
    new_value = round(current_val * multiplier, 2)
    
    # Skip Whale (já está perfeito)
    if price == 10.00:
        print(f"✓ {tier_names[price]:<10} (R$ {price:>5.2f}): {current_val:.2f} [MANTIDO] ({current_rtp:.1f}% ✅)")
        continue
    
    url = f"{base_url}/rest/v1/booster_types?price_brl=eq.{price}"
    response = requests.patch(url, headers=headers, json={"value_adjustment": new_value})
    
    if response.status_code in [200, 204]:
        print(f"✓ {tier_names[price]:<10} (R$ {price:>5.2f}): {current_val:.2f} → {new_value:.2f} ({current_rtp:.1f}% → 70%)")
    else:
        print(f"✗ {tier_names[price]:<10} ERRO: {response.status_code}")

print("=" * 70)
