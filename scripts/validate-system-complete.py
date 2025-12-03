"""Validar sistema de boosters após migration"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

print("=" * 80)
print("🎯 VALIDAÇÃO COMPLETA DO SISTEMA DE BOOSTERS")
print("=" * 80)

# 1. Verificar Jackpot Hard Cap
print("\n1️⃣ JACKPOT HARD CAP")
print("-" * 80)
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/edition_configs",
    headers=headers,
    params={'select': 'id,jackpot_hard_cap,godmode_multiplier', 'id': 'eq.ED01'}
)
if response.status_code == 200:
    edition = response.json()[0]
    hard_cap = edition['jackpot_hard_cap']
    godmode_mult = edition['godmode_multiplier']
    
    if float(hard_cap) >= 500:
        print(f"✅ Jackpot Hard Cap: R$ {hard_cap} (correto)")
    else:
        print(f"❌ Jackpot Hard Cap: R$ {hard_cap} (AINDA QUEBRADO!)")
    
    print(f"✅ Godmode Multiplier: {godmode_mult}x")

# 2. Verificar boosters criados
print("\n2️⃣ BOOSTERS CRIADOS")
print("-" * 80)
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_types",
    headers=headers,
    params={'select': '*', 'edition_id': 'eq.ED01', 'order': 'pack_id,price_brl'}
)

if response.status_code == 200:
    boosters = response.json()
    print(f"📦 Total: {len(boosters)} boosters")
    
    if len(boosters) != 15:
        print(f"⚠️  Esperado 15, encontrado {len(boosters)}")
    
    # Agrupar por pack
    by_pack = {}
    for b in boosters:
        pack = b.get('pack_id', 'NULL')
        if pack not in by_pack:
            by_pack[pack] = []
        by_pack[pack].append(b)
    
    print(f"\n📊 DISTRIBUIÇÃO POR PACK:")
    for pack, items in sorted(by_pack.items()):
        print(f"\n{pack}: {len(items)} boosters")
        for item in items:
            godmode = item['rarity_distribution'].get('godmode', 0)
            legendary = item['rarity_distribution'].get('legendary', 0)
            print(f"  • {item['name']:20} R$ {item['price_brl']:6.2f} | "
                  f"godmode:{godmode:4}% legendary:{legendary:3}% | mult:{item['price_multiplier']}x")
    
    # Verificar godmode ativado
    print(f"\n✅ GODMODE ATIVADO:")
    godmode_zero = [b for b in boosters if b['rarity_distribution'].get('godmode', 0) == 0]
    if godmode_zero:
        print(f"❌ {len(godmode_zero)} boosters ainda com godmode=0%:")
        for b in godmode_zero:
            print(f"   - {b['name']}")
    else:
        print(f"✅ Todos os {len(boosters)} boosters têm godmode > 0%")
    
    # Verificar pack_id preenchido
    print(f"\n✅ PACK_ID VINCULADO:")
    no_pack = [b for b in boosters if not b.get('pack_id')]
    if no_pack:
        print(f"❌ {len(no_pack)} boosters sem pack_id:")
        for b in no_pack:
            print(f"   - {b['name']}")
    else:
        print(f"✅ Todos os {len(boosters)} boosters têm pack_id")

# 3. Verificar tabela raspadinhas
print("\n3️⃣ TABELA RASPADINHAS (JACKPOTS)")
print("-" * 80)
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/raspadinhas",
    headers=headers,
    params={'select': '*,booster_types(name,price_brl)'}
)

if response.status_code == 200:
    raspadinhas = response.json()
    print(f"🎰 Total: {len(raspadinhas)} jackpots configurados")
    
    if len(raspadinhas) != 45:
        print(f"⚠️  Esperado 45 (15 boosters × 3 tiers), encontrado {len(raspadinhas)}")
    
    # Agrupar por booster
    by_booster = {}
    for r in raspadinhas:
        booster_name = r['booster_types']['name']
        booster_price = r['booster_types']['price_brl']
        key = f"{booster_name} (R$ {booster_price})"
        if key not in by_booster:
            by_booster[key] = []
        by_booster[key].append(r)
    
    print(f"\n📊 AMOSTRA (primeiros 5 boosters):")
    for i, (booster, jackpots) in enumerate(sorted(by_booster.items())[:5]):
        print(f"\n{booster}:")
        for j in sorted(jackpots, key=lambda x: x['multiplier'], reverse=True):
            prob_pct = float(j['probability']) * 100
            print(f"  • {j['tier']:8} {j['multiplier']:4}x prob: {prob_pct:.4f}%")
    
    # Verificar multiplicadores máximos
    print(f"\n✅ MULTIPLICADORES MÁXIMOS:")
    max_mults = {}
    for r in raspadinhas:
        booster_price = float(r['booster_types']['price_brl'])
        mult = r['multiplier']
        if booster_price not in max_mults or mult > max_mults[booster_price]:
            max_mults[booster_price] = mult
    
    for price in sorted(max_mults.keys()):
        max_mult = max_mults[price]
        max_payout = price * max_mult
        print(f"  R$ {price:6.2f}: até {max_mult:3}x = R$ {max_payout:8.2f} máximo")
        
elif response.status_code == 404:
    print("❌ Tabela raspadinhas NÃO EXISTE")

# 4. Verificar card pools
print("\n4️⃣ CARD POOLS (ALPHA/BETA/GAMMA)")
print("-" * 80)
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/pack_card_pools",
    headers=headers,
    params={'select': 'pack_id'}
)

if response.status_code == 200:
    pools = response.json()
    pack_counts = {}
    for p in pools:
        pack = p['pack_id']
        pack_counts[pack] = pack_counts.get(pack, 0) + 1
    
    print(f"🎴 CARTAS POR PACK:")
    for pack in sorted(pack_counts.keys()):
        count = pack_counts[pack]
        print(f"  {pack}: {count} cartas")
    
    if all(c >= 250 for c in pack_counts.values()):
        print(f"✅ Todos os packs têm card pools adequados")
    else:
        print(f"⚠️  Alguns packs com poucos cards")

# 5. Calcular RTP teórico
print("\n5️⃣ RTP TEÓRICO (com jackpot hard cap R$500)")
print("-" * 80)

if 'boosters' in locals() and len(boosters) > 0:
    # Liquidez base
    liq = {'trash': 0.01, 'meme': 0.03, 'viral': 0.10, 'legendary': 0.50, 'epica': 1.00}
    skin_avg = 1.5  # Multiplicador médio de skins
    
    print(f"\n📊 ANÁLISE POR TIER:")
    for b in boosters[:5]:  # Mostrar só um pack completo
        dist = b['rarity_distribution']
        
        # Valor esperado das cartas
        ev_cards = sum(
            (dist.get(rarity, 0) / 100.0) * liq.get(rarity, 0) 
            for rarity in ['trash', 'meme', 'viral', 'legendary', 'epica']
        ) * b['cards_per_booster'] * skin_avg
        
        # Godmode boost
        godmode_prob = dist.get('godmode', 0) / 100.0
        godmode_boost = godmode_prob * 10 * 0.5  # 10x mult, média 50 centavos
        
        # Jackpots (médias)
        # Assumir que há jackpots configurados
        jackpot_ev = b['price_brl'] * 0.02  # ~2% do preço em jackpots
        
        total_ev = ev_cards + godmode_boost + jackpot_ev
        rtp = (total_ev / b['price_brl']) * 100
        
        print(f"\n{b['name']}:")
        print(f"  Preço: R$ {b['price_brl']:.2f}")
        print(f"  EV Cartas: R$ {ev_cards:.2f}")
        print(f"  EV Godmode: R$ {godmode_boost:.2f}")
        print(f"  EV Jackpots: R$ {jackpot_ev:.2f}")
        print(f"  Total EV: R$ {total_ev:.2f}")
        print(f"  RTP: {rtp:.1f}%")

print("\n" + "=" * 80)
print("✅ VALIDAÇÃO COMPLETA")
print("=" * 80)
print("\n📋 PRÓXIMOS PASSOS:")
print("1. Adicionar coluna 'source' em booster_openings")
print("2. Atualizar frontend para exibir 3 packs (Alpha/Beta/Gamma)")
print("3. Implementar lógica de jackpots no backend")
print("4. Testar abertura de boosters em produção")
