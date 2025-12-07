import requests

base_url = "https://mmcytphoeyxeylvaqjgr.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

headers = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Resultados com 50 boosters (estatisticamente significativos)
adjustments = {
    0.50: (2.14, 54.7, 70 / 54.7),   # Básico: 2.14 * 1.28 = 2.74
    1.00: (2.20, 64.4, 70 / 64.4),   # Padrão: 2.20 * 1.09 = 2.40
    2.00: (0.67, 61.2, 70 / 61.2),   # Premium: 0.67 * 1.14 = 0.76
    5.00: (0.42, 65.4, 1.0),         # Elite: 0.42 [MANTIDO - JÁ OK!]
    10.00: (0.40, 91.6, 70 / 91.6)   # Whale: 0.40 * 0.76 = 0.30
}

tier_names = {
    0.50: "Básico",
    1.00: "Padrão",
    2.00: "Premium",
    5.00: "Elite",
    10.00: "Whale"
}

print("\n🎯 CALIBRAÇÃO FINAL BASEADA EM 50 BOOSTERS/TIER")
print("=" * 70)

for price, (current_val, current_rtp, multiplier) in adjustments.items():
    new_value = round(current_val * multiplier, 2)
    
    # Skip Elite (já está perfeito)
    if price == 5.00:
        print(f"✅ {tier_names[price]:<10} (R$ {price:>5.2f}): {current_val:.2f} [MANTIDO] ({current_rtp:.1f}% ✅)")
        continue
    
    url = f"{base_url}/rest/v1/booster_types?price_brl=eq.{price}"
    response = requests.patch(url, headers=headers, json={"value_adjustment": new_value})
    
    if response.status_code in [200, 204]:
        diff = current_rtp - 70
        arrow = "↑" if diff < 0 else "↓"
        print(f"✓ {tier_names[price]:<10} (R$ {price:>5.2f}): {current_val:.2f} → {new_value:.2f} ({current_rtp:.1f}% {arrow} 70%)")
    else:
        print(f"✗ {tier_names[price]:<10} ERRO: {response.status_code}")

print("=" * 70)
print(f"\n📊 DADOS: 250 boosters testados (50 por tier)")
print(f"💰 INVESTIMENTO: R$ 925")
print(f"✅ 1 tier já calibrado (Elite)")
print(f"🔧 4 tiers ajustados\n")
