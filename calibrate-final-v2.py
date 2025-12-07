import requests
import json

base_url = "https://rjhmwkbmdnlyfdfxyuqp.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaG13a2JtZG5seWZkZnh5dXFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTY5ODQ0NCwiZXhwIjoyMDQ3Mjc0NDQ0fQ.Yj8LqCeV1tCwb8L1uR6v2JTyZ-77KXLJiPBpHwIZCE0"

print("=" * 70)
print("🔧 AJUSTE FINAL V2 - Baseado em 100 boosters/tier")
print("=" * 70)
print()

# Resultados do teste de 100 boosters
test_results = [
    {"name": "Básico", "price": 0.50, "actual_rtp": 69.4, "current_adj": 2.74, "status": "✅ OK"},
    {"name": "Padrão", "price": 1.00, "actual_rtp": 72.5, "current_adj": 2.39, "status": "✅ OK"},
    {"name": "Premium", "price": 2.00, "actual_rtp": 65.7, "current_adj": 0.77, "status": "✅ OK"},
    {"name": "Elite", "price": 5.00, "actual_rtp": 98.9, "current_adj": 0.42, "status": "❌ ALTO"},
    {"name": "Whale", "price": 10.00, "actual_rtp": 62.7, "current_adj": 0.31, "status": "⚠️ BAIXO"},
]

target_rtp = 70.0

# Buscar todos os tiers
response = requests.get(
    f"{base_url}/rest/v1/booster_types?select=*",
    headers={
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}"
    }
)
all_tiers = response.json()

print("📊 ANÁLISE:")
print()

for result in test_results:
    print(f"{result['status']} {result['name']:12} (R$ {result['price']:5.2f})")
    print(f"   Atual: {result['actual_rtp']:5.1f}% RTP | value_adj: {result['current_adj']:.2f}")
    
    if result['status'] == "✅ OK":
        print(f"   ➜ MANTIDO (dentro do range 65-75%)")
        result['new_adj'] = result['current_adj']
    else:
        # Ajuste proporcional
        correction_factor = target_rtp / result['actual_rtp']
        new_adj = round(result['current_adj'] * correction_factor, 2)
        result['new_adj'] = new_adj
        print(f"   ➜ NOVO: {new_adj:.2f} (correção: {correction_factor:.3f}x)")
    print()

print("=" * 70)
print("💾 APLICANDO AJUSTES NO BANCO...")
print("=" * 70)
print()

# Aplicar apenas os que precisam de ajuste
for result in test_results:
    if result['new_adj'] != result['current_adj']:
        # Encontrar o tier no banco
        tier = next((t for t in all_tiers if abs(t['price_brl'] - result['price']) < 0.01), None)
        if tier:
            update_response = requests.patch(
                f"{base_url}/rest/v1/booster_types?id=eq.{tier['id']}",
                headers={
                    "apikey": service_key,
                    "Authorization": f"Bearer {service_key}",
                    "Content-Type": "application/json"
                },
                json={"value_adjustment": result['new_adj']}
            )
            
            if update_response.status_code in [200, 204]:
                print(f"✓ {result['name']:12} (R$ {result['price']:5.2f}): {result['current_adj']:.2f} → {result['new_adj']:.2f} ({result['actual_rtp']:.1f}% → 70%)")
            else:
                print(f"✗ {result['name']:12}: ERRO {update_response.status_code}")
    else:
        print(f"✅ {result['name']:12} (R$ {result['price']:5.2f}): {result['current_adj']:.2f} [MANTIDO] ({result['actual_rtp']:.1f}% ✅)")

print()
print("=" * 70)
print("📊 RESUMO FINAL:")
print("=" * 70)
print(f"🎯 TARGET: 70% ±5% (range 65-75%)")
print(f"✅ 3 tiers OK (Básico, Padrão, Premium)")
print(f"🔧 2 tiers ajustados (Elite, Whale)")
print()
print("💰 DADOS: 500 boosters testados")
print("💵 INVESTIMENTO: R$ 1850")
print()
print("⚠️ RECOMENDAÇÃO: Testar Elite novamente (teve outlier de 1386%)")
