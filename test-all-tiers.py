import requests
import json
import uuid

# Supabase config
base_url = "https://mmcytphoeyxeylvaqjgr.supabase.co"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTQyMjAsImV4cCI6MjA3OTY5MDIyMH0.i1bcSAGL_J-vxc6gxwXZZxfn7GJl8puL5eYwe9UkZAs"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

# Login
print("\n=== FAZENDO LOGIN ===")
response = requests.post(
    f"{base_url}/auth/v1/token?grant_type=password",
    headers={"apikey": anon_key, "Content-Type": "application/json"},
    json={"email": "Akroma.julio@gmail.com", "password": "Akroma!t8g86v8t!3159"}
)

if response.status_code != 200:
    print(f"✗ Erro no login: {response.status_code}")
    print(response.text)
    exit(1)

auth_data = response.json()
access_token = auth_data["access_token"]
user_id = auth_data["user"]["id"]
print(f"✓ Login bem-sucedido! User ID: {user_id}")

# Fetch all tiers
print("\n=== BUSCANDO TODOS OS TIERS ===")
response = requests.get(
    f"{base_url}/rest/v1/booster_types?select=id,name,price_brl,value_adjustment,pack_id&order=price_brl.asc",
    headers={"apikey": anon_key, "Authorization": f"Bearer {access_token}"}
)

all_tiers = response.json()
print(f"Encontrados {len(all_tiers)} tiers")

# Group by price (Alpha/Beta/Gamma variants) - APENAS ELITE E WHALE
tiers_by_price = {}
for tier in all_tiers:
    price = tier['price_brl']
    if price in [5.00, 10.00]:  # FILTRAR APENAS ELITE E WHALE
        if price not in tiers_by_price:
            tiers_by_price[price] = []
        tiers_by_price[price].append(tier)

tier_names = {
    0.50: "Básico",
    1.00: "Padrão",
    2.00: "Premium",
    5.00: "Elite",
    10.00: "Whale"
}

# Test each tier (1 random variant per price)
import random

print("\n" + "="*70)
print("🎯 VALIDAÇÃO FINAL: 50 ELITE + 50 WHALE (R$ 750 total)")
print("="*70)

all_results = {}

for price in sorted(tiers_by_price.keys()):
    tier_group = tiers_by_price[price]
    # Pick random variant (Alpha/Beta/Gamma)
    selected_tier = random.choice(tier_group)
    
    name = tier_names.get(price, f"R$ {price}")
    print(f"\n{'='*70}")
    print(f"📦 TESTANDO {name.upper()} (R$ {price})")
    print(f"   Variant: {selected_tier['name']}")
    print(f"   value_adjustment: {selected_tier['value_adjustment']}")
    print(f"{'='*70}")
    
    tier_rtps = []
    
    for i in range(1, 51):  # 50 boosters per tier
        opening_id = str(uuid.uuid4())
        
        # Create opening
        create_response = requests.post(
            f"{base_url}/rest/v1/booster_openings",
            headers={
                "apikey": service_key,
                "Authorization": f"Bearer {service_key}",
                "Content-Type": "application/json"
            },
            json={
                "id": opening_id,
                "user_id": user_id,
                "booster_type_id": selected_tier['pack_id'],
                "price_paid_brl": price,
                "cards_obtained": [],
                "opened_at": None
            }
        )
        
        if create_response.status_code not in [200, 201]:
            print(f"✗ Erro criando opening {i}: {create_response.status_code} - {create_response.text[:100]}")
            continue
        
        # Open booster
        open_response = requests.post(
            "https://frontend-ggoowimeo-razzachans-projects.vercel.app/api/v1/boosters/open",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json={
                "booster_type_id": selected_tier['id'],
                "opening_id": opening_id
            }
        )
        
        if open_response.status_code != 200:
            print(f"✗ Booster {i}: Erro {open_response.status_code}")
            continue
        
        result = open_response.json()
        if result.get('ok'):
            cards = result['data']['cards']
            total = sum(card['liquidity_brl'] for card in cards)
            rtp = (total / price) * 100
            tier_rtps.append(rtp)
            
            # Show progress every 5 boosters
            if i % 5 == 0:
                print(f"  Boosters 1-{i}: Avg {sum(tier_rtps)/len(tier_rtps):.1f}% RTP")
        else:
            error_msg = result.get('error', result.get('message', str(result)[:100]))
            print(f"✗ Booster {i}: {error_msg}")
    
    if tier_rtps:
        avg_rtp = sum(tier_rtps) / len(tier_rtps)
        all_results[name] = {
            'price': price,
            'avg_rtp': avg_rtp,
            'min_rtp': min(tier_rtps),
            'max_rtp': max(tier_rtps),
            'value_adjustment': selected_tier['value_adjustment']
        }
        
        status = "✅" if 65 <= avg_rtp <= 75 else "⚠️" if 60 <= avg_rtp <= 80 else "❌"
        print(f"\n{status} MÉDIA: {avg_rtp:.1f}% RTP (range: {min(tier_rtps):.1f}%-{max(tier_rtps):.1f}%)")

# Final summary
print("\n" + "="*70)
print("📊 RESUMO GERAL - TODOS OS TIERS")
print("="*70)

for name in ["Básico", "Padrão", "Premium", "Elite", "Whale"]:
    if name in all_results:
        data = all_results[name]
        status = "✅" if 65 <= data['avg_rtp'] <= 75 else "⚠️" if 60 <= data['avg_rtp'] <= 80 else "❌"
        print(f"{status} {name:<10} (R$ {data['price']:>5.2f}): {data['avg_rtp']:>6.1f}% RTP | val_adj: {data['value_adjustment']:.2f}")

print("="*70)
print("\n🎯 TARGET: 70% ±5% (range 65-75%)")
print("✅ = dentro do target | ⚠️ = próximo | ❌ = fora do range\n")
