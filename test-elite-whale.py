import requests
import json
import uuid
import random

# Configuração
base_url = "https://mmcytphoeyxeylvaqjgr.supabase.co"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTQyMjAsImV4cCI6MjA3OTY5MDIyMH0.i1bcSAGL_J-vxc6gxwXZZxfn7GJl8puL5eYwe9UkZAs"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"
email = "Akroma.julio@gmail.com"
password = "Akroma!t8g86v8t!3159"

print("=" * 70)
print("🎯 TESTE FOCADO: ELITE + WHALE")
print("=" * 70)
print()

# Login
print("=== FAZENDO LOGIN ===")
auth_response = requests.post(
    f"{base_url}/auth/v1/token?grant_type=password",
    headers={
        "apikey": anon_key,
        "Content-Type": "application/json"
    },
    json={"email": email, "password": password}
)

if auth_response.status_code != 200:
    print(f"❌ Erro no login: {auth_response.status_code}")
    print(auth_response.text)
    exit(1)

auth_data = auth_response.json()
access_token = auth_data['access_token']
user_id = auth_data['user']['id']
print(f"✓ Login bem-sucedido! User ID: {user_id}")
print()

# Buscar tiers
print("=== BUSCANDO TIERS ELITE E WHALE ===")
response = requests.get(
    f"{base_url}/rest/v1/booster_types?select=*",
    headers={
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}"
    }
)
all_tiers = response.json()

# Filtrar Elite e Whale
elite_tiers = [t for t in all_tiers if t['price_brl'] == 5.00]
whale_tiers = [t for t in all_tiers if t['price_brl'] == 10.00]

print(f"Encontrados {len(elite_tiers)} variants Elite")
print(f"Encontrados {len(whale_tiers)} variants Whale")
print()

# Configuração dos testes
test_configs = [
    {"name": "Elite", "price": 5.00, "tiers": elite_tiers, "count": 30},
    {"name": "Whale", "price": 10.00, "tiers": whale_tiers, "count": 30},
]

results = {}

for config in test_configs:
    tier_name = config['name']
    price = config['price']
    tiers_list = config['tiers']
    test_count = config['count']
    
    print("=" * 70)
    print(f"📦 TESTANDO {tier_name.upper()} (R$ {price}) - {test_count} BOOSTERS")
    
    # Selecionar variant aleatório
    selected_tier = random.choice(tiers_list)
    print(f"   Variant: {selected_tier['name']}")
    print(f"   value_adjustment: {selected_tier['value_adjustment']}")
    print("=" * 70)
    
    tier_rtps = []
    tier_min = float('inf')
    tier_max = 0
    
    for i in range(1, test_count + 1):
        opening_id = str(uuid.uuid4())
        
        # Criar opening
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
            print(f"❌ Erro ao criar opening: {create_response.status_code}")
            continue
        
        # Abrir booster
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
            print(f"❌ Erro ao abrir booster {i}: {open_response.status_code}")
            print(f"   Response: {open_response.text[:200]}")
            continue
        
        result = open_response.json()
        
        # Debug primeira iteração
        if i == 1:
            print(f"   DEBUG primeira abertura: {json.dumps(result, indent=2)[:500]}")
        
        if result.get('ok'):
            cards = result.get('cards', [])
            total_liquidity = sum(card['liquidity_brl'] for card in cards)
            rtp = (total_liquidity / price) * 100
            
            tier_rtps.append(rtp)
            tier_min = min(tier_min, rtp)
            tier_max = max(tier_max, rtp)
            
            # Progresso a cada 5 boosters
            if i % 5 == 0:
                current_avg = sum(tier_rtps) / len(tier_rtps)
                print(f"  Boosters 1-{i}: Avg {current_avg:.1f}% RTP (range: {tier_min:.1f}%-{tier_max:.1f}%)")
        else:
            print(f"⚠️ Booster {i}: ok=false, erro: {result.get('error', 'desconhecido')}")
    
    # Calcular estatísticas
    avg_rtp = sum(tier_rtps) / len(tier_rtps) if tier_rtps else 0
    
    # Status visual
    if 65 <= avg_rtp <= 75:
        status = "✅"
    elif 60 <= avg_rtp <= 80:
        status = "⚠️"
    else:
        status = "❌"
    
    print()
    print(f"{status} MÉDIA: {avg_rtp:.1f}% RTP (range: {tier_min:.1f}%-{tier_max:.1f}%)")
    print()
    
    results[tier_name] = {
        "avg": avg_rtp,
        "min": tier_min,
        "max": tier_max,
        "count": len(tier_rtps),
        "status": status,
        "value_adj": selected_tier['value_adjustment']
    }

# Resumo final
print("=" * 70)
print("📊 RESUMO FINAL - TESTE FOCADO")
print("=" * 70)

for tier_name, data in results.items():
    price_map = {"Elite": 5.00, "Whale": 10.00}
    price = price_map[tier_name]
    
    print(f"{data['status']} {tier_name:12} (R$ {price:5.2f}): {data['avg']:5.1f}% RTP | val_adj: {data['value_adj']:.2f}")
    print(f"   Range: {data['min']:.1f}% - {data['max']:.1f}% | {data['count']} boosters")

print("=" * 70)
print()
print("🎯 TARGET: 70% ±5% (range 65-75%)")
print("✅ = dentro do target | ⚠️ = próximo | ❌ = fora do range")
print()

# Análise de ajustes
print("=" * 70)
print("🔧 ANÁLISE DE AJUSTES NECESSÁRIOS")
print("=" * 70)

for tier_name, data in results.items():
    price_map = {"Elite": 5.00, "Whale": 10.00}
    price = price_map[tier_name]
    
    if data['avg'] == 0:
        print(f"❌ {tier_name}: SEM DADOS (todas as aberturas falharam)")
        continue
    
    if data['status'] == "✅":
        print(f"✅ {tier_name}: PERFEITO! Manter value_adjustment em {data['value_adj']:.2f}")
    elif data['status'] == "⚠️":
        correction = 70.0 / data['avg']
        new_adj = round(data['value_adj'] * correction, 2)
        print(f"⚠️ {tier_name}: Próximo do target")
        print(f"   Sugestão de ajuste fino: {data['value_adj']:.2f} → {new_adj:.2f}")
    else:
        correction = 70.0 / data['avg']
        new_adj = round(data['value_adj'] * correction, 2)
        print(f"❌ {tier_name}: FORA DO TARGET")
        print(f"   Ajuste necessário: {data['value_adj']:.2f} → {new_adj:.2f}")
        print(f"   SQL: UPDATE booster_types SET value_adjustment = {new_adj} WHERE price_brl = {price};")

print()
total_cost = (results['Elite']['count'] * 5.00) + (results['Whale']['count'] * 10.00)
print(f"💰 CUSTO TOTAL: R$ {total_cost:.2f}")
print(f"📊 BOOSTERS TESTADOS: {results['Elite']['count']} Elite + {results['Whale']['count']} Whale")
