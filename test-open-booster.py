import requests
import json
import uuid

# Supabase config
base_url = "https://mmcytphoeyxeylvaqjgr.supabase.co"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTQyMjAsImV4cCI6MjA3OTY5MDIyMH0.i1bcSAGL_J-vxc6gxwXZZxfn7GJl8puL5eYwe9UkZAs"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDExNDIyMCwiZXhwIjoyMDc5NjkwMjIwfQ.mPKc2a3A4kL1LUzX9BjTsaCz3OGAWLGIBYV0TSa20Fw"

# Login
print("\n=== FAZENDO LOGIN ===")
login_response = requests.post(
    f"{base_url}/auth/v1/token?grant_type=password",
    headers={"apikey": anon_key, "Content-Type": "application/json"},
    json={
        "email": "Akroma.julio@gmail.com",
        "password": "Akroma!t8g86v8t!3159"
    }
)

if login_response.status_code != 200:
    print(f"Erro no login: {login_response.status_code}")
    print(login_response.text)
    exit(1)

auth_data = login_response.json()
access_token = auth_data['access_token']
user_id = auth_data['user']['id']

print(f"✓ Login bem-sucedido! User ID: {user_id}")

# Get Whale booster type
print("\n=== BUSCANDO BOOSTER WHALE ===")
headers = {
    "apikey": anon_key,
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

booster_response = requests.get(
    f"{base_url}/rest/v1/booster_types",
    headers=headers,
    params={"price_brl": "eq.10.00", "limit": 1}
)

whale_booster = booster_response.json()[0]
booster_type_id = whale_booster['id']
pack_id = whale_booster['pack_id']

print(f"✓ Booster: {whale_booster['name']} (R$ {whale_booster['price_brl']})")
print(f"  Value Adjustment: {whale_booster.get('value_adjustment', 'N/A')}")
print(f"  Pack ID: {pack_id}")

# Open 10 boosters (validação rápida)
all_rtps = []
godmode_count = 0
rarity_count = {}
skin_count = {}

for test_num in range(1, 11):
    # Create new opening_id for each test
    opening_id = str(uuid.uuid4())
    
    # Create opening session
    create_opening_response = requests.post(
        f"{base_url}/rest/v1/booster_openings",
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json"
        },
        json={
            "id": opening_id,
            "user_id": user_id,
            "booster_type_id": pack_id,
            "price_paid_brl": 10.0,
            "cards_obtained": [],
            "opened_at": None
        }
    )
    
    if create_opening_response.status_code not in [200, 201]:
        print(f"\n✗ Erro ao criar sessão {test_num}: {create_opening_response.status_code}")
        continue

    # Open booster
    print(f"\n=== ABRINDO BOOSTER WHALE #{test_num} ===")
    open_response = requests.post(
        f"https://frontend-ggoowimeo-razzachans-projects.vercel.app/api/v1/boosters/open",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        },
        json={
            "booster_type_id": booster_type_id,
            "opening_id": opening_id
        }
    )

    if open_response.status_code != 200:
        print(f"✗ Erro ao abrir: {open_response.status_code}")
        print(open_response.text)
        continue
    
    result = open_response.json()

    if 'data' in result and 'cards' in result['data']:
        cards = result['data']['cards']
        
        # Mostrar todos os boosters
        print(f"✓ Booster #{test_num}: {len(cards)} cartas")
        
        total_value = 0
        for i, card in enumerate(cards, 1):
            value = card.get('liquidity_brl', 0)
            total_value += value
            card_name = card.get('card', {}).get('name', 'Unknown')
            rarity = card.get('card', {}).get('rarity', 'unknown')
            skin = card.get('skin', 'default')
            is_godmode = card.get('is_godmode', False)
            
            # Contadores
            if is_godmode:
                godmode_count += 1
            rarity_count[rarity] = rarity_count.get(rarity, 0) + 1
            skin_count[skin] = skin_count.get(skin, 0) + 1
            
            godmode_label = " 🌟GODMODE" if is_godmode else ""
            print(f"  {i}. {card_name}{godmode_label} ({rarity}/{skin}) R$ {value:.2f}")
        
        rtp = (total_value / 10.0) * 100
        all_rtps.append(rtp)
        
        print(f"  💰 TOTAL: R$ {total_value:.2f} | RTP: {rtp:.1f}%\n")

# Summary
if all_rtps:
    print("\n" + "="*70)
    print("📊 VALIDAÇÃO: 10 BOOSTERS WHALE (R$ 100 gastos)")
    print("="*70)
    avg_rtp = sum(all_rtps) / len(all_rtps)
    min_rtp = min(all_rtps)
    max_rtp = max(all_rtps)
    
    print(f"\n💰 RTP:")
    print(f"  Médio:  {avg_rtp:.2f}%")
    print(f"  Mínimo: {min_rtp:.1f}%")
    print(f"  Máximo: {max_rtp:.1f}%")
    
    print(f"\n🌟 GODMODES: {godmode_count} / 50 cartas ({(godmode_count/50)*100:.2f}%)")
    
    print(f"\n{'='*70}")
    print(f"🎯 TARGET: 70%")
    print(f"📊 OBTIDO: {avg_rtp:.2f}%")
    print(f"📉 DIFERENÇA: {avg_rtp - 70:.2f}%")
    
    if 65 <= avg_rtp <= 75:
        print(f"\n✅ PERFEITO: RTP dentro do target ±5%!")
    elif 60 <= avg_rtp <= 80:
        print(f"\n⚠️  ACEITÁVEL: RTP próximo do target")
    else:
        print(f"\n🚨 PRECISA AJUSTAR: RTP fora do range")
    print(f"{'='*70}")
else:
    print("\nNenhum booster foi aberto com sucesso.")
