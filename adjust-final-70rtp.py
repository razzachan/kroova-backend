import requests

base_url = "https://mmcytphoeyxeylvaqjgr.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

headers = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Resultados dos testes (RTP atual vs target 70%)
adjustments = {
    0.50: (2.00, 55.2, 70 / 55.2),   # Básico: 2.00 * 1.27 = 2.54
    1.00: (2.15, 49.5, 70 / 49.5),   # Padrão: 2.15 * 1.41 = 3.03
    2.00: (0.61, 44.7, 70 / 44.7),   # Premium: 0.61 * 1.57 = 0.96
    5.00: (0.45, 113.7, 70 / 113.7), # Elite: 0.45 * 0.62 = 0.28
    10.00: (0.56, 99.1, 70 / 99.1)   # Whale: 0.56 * 0.71 = 0.40
}

tier_names = {
    0.50: "Básico",
    1.00: "Padrão",
    2.00: "Premium",
    5.00: "Elite",
    10.00: "Whale"
}

print("\n🎯 CORREÇÃO FINAL PARA RTP 70%")
print("=" * 70)

for price, (current_val, current_rtp, multiplier) in adjustments.items():
    new_value = round(current_val * multiplier, 2)
    
    url = f"{base_url}/rest/v1/booster_types?price_brl=eq.{price}"
    response = requests.patch(url, headers=headers, json={"value_adjustment": new_value})
    
    if response.status_code in [200, 204]:
        print(f"✓ {tier_names[price]:<10} (R$ {price:>5.2f}): {current_val:.2f} → {new_value:.2f} ({current_rtp:.1f}% → 70%)")
    else:
        print(f"✗ {tier_names[price]:<10} ERRO: {response.status_code}")

print("=" * 70)
print("\n✅ TODOS OS TIERS AJUSTADOS PARA RTP ~70%")
