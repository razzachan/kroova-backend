"""
Setup do sistema correto de boosters ED01
Baseado em KROOVA_BOOSTER_PACK_FINAL_SPEC.md
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

# SISTEMA CORRETO: 5 boosters individuais + 4 packs
CORRECT_BOOSTERS = [
    # TIER 1: Boosters Individuais
    {
        "name": "Básico",
        "edition_id": "ED01",
        "price_brl": 0.50,
        "cards_per_booster": 5,
        "price_multiplier": 1,
        "rarity_distribution": {
            "trash": 60,
            "meme": 28,
            "viral": 10,
            "legendary": 1.8,
            "godmode": 0.2  # 0.2% godmode
        }
    },
    {
        "name": "Padrão",
        "edition_id": "ED01",
        "price_brl": 1.00,
        "cards_per_booster": 5,
        "price_multiplier": 2,
        "rarity_distribution": {
            "trash": 58,
            "meme": 30,
            "viral": 10,
            "legendary": 1.8,
            "godmode": 0.2
        }
    },
    {
        "name": "Premium",
        "edition_id": "ED01",
        "price_brl": 2.00,
        "cards_per_booster": 5,
        "price_multiplier": 4,
        "rarity_distribution": {
            "trash": 55,
            "meme": 32,
            "viral": 11,
            "legendary": 1.8,
            "godmode": 0.2
        }
    },
    {
        "name": "Elite",
        "edition_id": "ED01",
        "price_brl": 5.00,
        "cards_per_booster": 5,
        "price_multiplier": 10,
        "rarity_distribution": {
            "trash": 50,
            "meme": 34,
            "viral": 13,
            "legendary": 2.5,
            "godmode": 0.5  # 0.5% godmode
        }
    },
    {
        "name": "Whale",
        "edition_id": "ED01",
        "price_brl": 10.00,
        "cards_per_booster": 5,
        "price_multiplier": 20,
        "rarity_distribution": {
            "trash": 45,
            "meme": 35,
            "viral": 15,
            "legendary": 4.0,
            "godmode": 1.0  # 1% godmode
        }
    },
    
    # TIER 2: Pacotes com Desconto
    {
        "name": "Pack Viral",
        "edition_id": "ED01",
        "price_brl": 2.25,
        "cards_per_booster": 25,
        "price_multiplier": 1,
        "rarity_distribution": {
            "trash": 58,
            "meme": 30,
            "viral": 10,
            "legendary": 1.8,
            "godmode": 0.2
        }
    },
    {
        "name": "Pack Lendário",
        "edition_id": "ED01",
        "price_brl": 4.00,
        "cards_per_booster": 50,
        "price_multiplier": 2,
        "rarity_distribution": {
            "trash": 55,
            "meme": 32,
            "viral": 11,
            "legendary": 1.8,
            "godmode": 0.2
        }
    },
    {
        "name": "Pack Épico",
        "edition_id": "ED01",
        "price_brl": 9.00,
        "cards_per_booster": 125,
        "price_multiplier": 4,
        "rarity_distribution": {
            "trash": 45,
            "meme": 30,
            "viral": 16,
            "legendary": 7.0,
            "godmode": 2.0  # 2% godmode (125 cartas)
        }
    },
    {
        "name": "Pack Colecionador",
        "edition_id": "ED01",
        "price_brl": 16.00,
        "cards_per_booster": 250,
        "price_multiplier": 10,
        "rarity_distribution": {
            "trash": 40,
            "meme": 30,
            "viral": 18,
            "legendary": 9.0,
            "godmode": 3.0  # 3% godmode (250 cartas)
        }
    }
]

def delete_obsolete_boosters():
    """Deletar todos boosters ED01 atuais (13 obsoletos)"""
    print("🗑️  DELETANDO BOOSTERS OBSOLETOS...")
    
    url = f"{SUPABASE_URL}/rest/v1/booster_types"
    params = {
        'edition_id': 'eq.ED01'
    }
    
    response = requests.delete(url, headers=headers, params=params)
    
    if response.status_code in [200, 204]:
        print(f"✅ Boosters obsoletos deletados")
    else:
        print(f"❌ Erro ao deletar: {response.status_code}")
        print(response.text)

def create_correct_boosters():
    """Criar 9 boosters corretos"""
    print("\n📦 CRIANDO BOOSTERS CORRETOS...")
    
    url = f"{SUPABASE_URL}/rest/v1/booster_types"
    
    for booster in CORRECT_BOOSTERS:
        response = requests.post(url, headers=headers, json=booster)
        
        if response.status_code == 201:
            print(f"✅ {booster['name']:20} | R$ {booster['price_brl']:6.2f} | {booster['cards_per_booster']:3} cards | godmode: {booster['rarity_distribution']['godmode']}%")
        else:
            print(f"❌ Erro criando {booster['name']}: {response.status_code}")
            print(response.text)

def fix_jackpot_cap():
    """Corrigir Jackpot Hard Cap de R$0.15 para R$500"""
    print("\n💰 CORRIGINDO JACKPOT HARD CAP...")
    
    url = f"{SUPABASE_URL}/rest/v1/edition_configs"
    params = {
        'id': 'eq.ED01'
    }
    
    data = {
        "jackpot_hard_cap": 500.00
    }
    
    response = requests.patch(url, headers=headers, params=params, json=data)
    
    if response.status_code == 200:
        print(f"✅ Jackpot Hard Cap: R$ 0.15 → R$ 500.00")
    else:
        print(f"❌ Erro ao corrigir cap: {response.status_code}")
        print(response.text)

def verify_setup():
    """Verificar configuração final"""
    print("\n🔍 VERIFICANDO CONFIGURAÇÃO FINAL...")
    
    # Verificar boosters
    url = f"{SUPABASE_URL}/rest/v1/booster_types"
    params = {
        'select': '*',
        'edition_id': 'eq.ED01',
        'order': 'price_brl.asc'
    }
    
    response = requests.get(url, headers=headers, params=params)
    boosters = response.json()
    
    print(f"\n📊 BOOSTERS CADASTRADOS ({len(boosters)}):")
    print("-" * 80)
    for b in boosters:
        godmode = b.get('rarity_distribution', {}).get('godmode', 0)
        print(f"{b['name']:20} | R$ {b['price_brl']:6.2f} | {b['cards_per_booster']:3} cards | godmode: {godmode}%")
    
    # Verificar edition config
    url = f"{SUPABASE_URL}/rest/v1/edition_configs"
    params = {
        'select': 'id,jackpot_hard_cap,godmode_multiplier,rtp_target',
        'id': 'eq.ED01'
    }
    
    response = requests.get(url, headers=headers, params=params)
    config = response.json()[0] if response.json() else {}
    
    print("\n⚙️  EDITION CONFIG:")
    print(f"   Jackpot Hard Cap: R$ {config.get('jackpot_hard_cap', 0):.2f}")
    print(f"   Godmode Multiplier: {config.get('godmode_multiplier', 0)}x")
    print(f"   RTP Target: {config.get('rtp_target', 0)*100:.0f}%")
    
    # Calcular max payout
    max_base_liq = 1.00  # godmode epica
    max_skin_mult = 6.0  # holo
    godmode_mult = config.get('godmode_multiplier', 10)
    jackpot_cap = config.get('jackpot_hard_cap', 500)
    
    print("\n💎 MAX PAYOUT POR TIER:")
    print("-" * 80)
    for b in boosters:
        mult = b.get('price_multiplier', 1)
        max_payout = max_base_liq * max_skin_mult * mult * godmode_mult
        max_payout_capped = min(max_payout, jackpot_cap)
        multiplier_vs_price = max_payout_capped / b['price_brl']
        
        print(f"{b['name']:20} | R$ {b['price_brl']:6.2f} → Max: R$ {max_payout:6.2f} (capped: R$ {max_payout_capped:6.2f}) = {multiplier_vs_price:5.1f}x")

if __name__ == '__main__':
    print("=" * 80)
    print("🔧 SETUP DO SISTEMA CORRETO DE BOOSTERS ED01")
    print("=" * 80)
    
    # ETAPA 1: Deletar obsoletos
    delete_obsolete_boosters()
    
    # ETAPA 2: Criar corretos
    create_correct_boosters()
    
    # ETAPA 3: Corrigir jackpot cap
    fix_jackpot_cap()
    
    # ETAPA 4: Verificar
    verify_setup()
    
    print("\n" + "=" * 80)
    print("✅ SETUP COMPLETO!")
    print("=" * 80)
    print("\n📝 PRÓXIMOS PASSOS:")
    print("   1. Deploy frontend (atualizar referências pack_id)")
    print("   2. Testar compra de cada tier")
    print("   3. Validar drops de godmode")
    print("   4. Executar ADD_SOURCE_COLUMN.sql no Supabase")
