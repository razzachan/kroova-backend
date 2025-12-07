import requests

base_url = "https://mmcytphoeyxeylvaqjgr.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

headers = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Teste 1 (20 boosters): 0.26 → 39% RTP
# Teste 2 (10 boosters): 0.58 → 158% RTP
# 
# Vamos usar média ponderada: 0.26 deu -31% erro, 0.58 deu +88% erro
# Média simples: (0.26 + 0.58) / 2 = 0.42
# Mas como 158% está mais longe, vamos tender mais para 0.26
# Tentativa: 0.35 (entre 0.26 e 0.42)

adjustments = {
    0.50: 0.65,   # Básico: reduzindo de 1.31
    1.00: 0.63,   # Padrão: reduzindo de 1.28
    2.00: 0.22,   # Premium: reduzindo de 0.44
    5.00: 0.09,   # Elite: reduzindo de 0.18
    10.00: 0.35   # Whale: meio-termo entre 0.26 (39%) e 0.58 (158%)
}

tier_names = {
    0.50: "Básico",
    1.00: "Padrão", 
    2.00: "Premium",
    5.00: "Elite",
    10.00: "Whale"
}

print("\n🎯 AJUSTANDO PARA RTP ~70% (CORREÇÃO)")
print("=" * 60)
print("Teste 1: 0.26 → 39% RTP (-31%)")
print("Teste 2: 0.58 → 158% RTP (+88%)")
print("Novo valor: 0.35 (conservador, tendendo a 0.26)")
print("=" * 60)

for price, new_value in adjustments.items():
    url = f"{base_url}/rest/v1/booster_types?price_brl=eq.{price}"
    response = requests.patch(url, headers=headers, json={"value_adjustment": new_value})
    
    if response.status_code in [200, 204]:
        print(f"✓ {tier_names[price]:<10} (R$ {price:>5.2f}): {new_value:.2f}")
    else:
        print(f"✗ {tier_names[price]:<10} ERRO: {response.status_code}")

print("=" * 60)
