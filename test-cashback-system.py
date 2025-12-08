#!/usr/bin/env python3
"""
Teste completo do sistema de cashback e pontos de reciclagem
"""

import requests
import json

# Configuração
SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTQyMjAsImV4cCI6MjA3OTY5MDIyMH0.i1bcSAGL_J-vxc6gxwXZZxfn7GJl8puL5eYwe9UkZAs"
FRONTEND_URL = "https://frontend-ne6vpyimg-razzachans-projects.vercel.app"

EMAIL = "akroma.julio@gmail.com"
PASSWORD = "Akroma!t8g86v8t!3159"

def login():
    """Fazer login e retornar access_token"""
    print(f"\n🔐 Fazendo login como {EMAIL}...")
    response = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        },
        json={"email": EMAIL, "password": PASSWORD}
    )
    
    if response.status_code != 200:
        print(f"❌ Erro no login: {response.status_code}")
        print(response.text)
        exit(1)
    
    token = response.json()['access_token']
    print(f"✅ Login realizado! Token: {token[:20]}...")
    return token

def test_booster_opening(token):
    """Teste 1: Abrir booster e verificar cashback"""
    print("\n" + "="*80)
    print("🧪 TESTE 1: ABERTURA DE BOOSTER COM CASHBACK")
    print("="*80)
    
    # Comprar booster Básico
    print("\n1️⃣ Comprando booster Básico (R$ 0.50)...")
    response = requests.get(
        f"{FRONTEND_URL}/api/v1/boosters",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200:
        print(f"❌ Erro ao buscar boosters: {response.status_code}")
        return None
    
    boosters = response.json()['data']
    basico = next((b for b in boosters if 'Básico' in b['name']), None)
    
    if not basico:
        print("❌ Booster Básico não encontrado")
        print(f"Boosters disponíveis: {[b['name'] for b in boosters]}")
        return None
    
    print(f"✅ Encontrado: {basico['name']} (R$ {basico['price_brl']})")
    
    # Comprar
    buy_response = requests.post(
        f"{FRONTEND_URL}/api/v1/boosters/purchase",
        headers={"Authorization": f"Bearer {token}"},
        json={"booster_type_id": basico['id'], "quantity": 1}
    )
    
    if buy_response.status_code != 200:
        print(f"❌ Erro ao comprar: {buy_response.status_code}")
        print(buy_response.text)
        return None
    
    buy_data = buy_response.json()
    print(f"✅ Booster comprado!")
    
    # A resposta tem 'boosters' com lista de IDs
    if 'data' in buy_data and 'boosters' in buy_data['data']:
        opening_id = buy_data['data']['boosters'][0]['id']
    elif 'data' in buy_data and 'openings' in buy_data['data']:
        opening_id = buy_data['data']['openings'][0]
    elif 'data' in buy_data and 'opening_id' in buy_data['data']:
        opening_id = buy_data['data']['opening_id']
    else:
        print(f"❌ Estrutura de resposta desconhecida: {buy_data}")
        return None
    
    print(f"Opening ID: {opening_id}")
    
    # Abrir
    print("\n2️⃣ Abrindo booster...")
    open_response = requests.post(
        f"{FRONTEND_URL}/api/v1/boosters/open",
        headers={"Authorization": f"Bearer {token}"},
        json={"opening_id": opening_id}
    )
    
    if open_response.status_code != 200:
        print(f"❌ Erro ao abrir: {open_response.status_code}")
        print(open_response.text)
        return None
    
    data = open_response.json()['data']
    cards = data['cards']
    prize = data.get('prize', {})
    
    print(f"✅ Booster aberto! {len(cards)} cartas recebidas")
    print(f"\n💰 PRÊMIO SLOT MACHINE:")
    print(f"   Valor: R$ {prize.get('amount_brl', 0):.2f}")
    print(f"   RTP: {prize.get('rtp_percentage', 0):.1f}%")
    print(f"   Tier: {prize.get('prize_tier', 'N/A')}")
    
    # Verificar cashback nas cartas
    print(f"\n💵 CASHBACK DAS CARTAS:")
    card_ids = []
    for i, card in enumerate(cards, 1):
        card_ids.append(card['id'])
        # Buscar detalhes da carta com cashback
        card_response = requests.get(
            f"{SUPABASE_URL}/rest/v1/cards_instances?id=eq.{card['id']}&select=id,prize_amount_brl,prize_redeemed",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {token}"
            }
        )
        
        if card_response.status_code == 200:
            card_data = card_response.json()[0]
            cashback = card_data.get('prize_amount_brl', 0)
            redeemed = card_data.get('prize_redeemed', False)
            print(f"   Carta {i}: R$ {cashback:.4f} | Resgatado: {redeemed}")
    
    print(f"\n📊 MATEMÁTICA:")
    print(f"   Custo do booster: R$ 0.50")
    print(f"   Cashback esperado: R$ 0.005/carta (1% / 5)")
    print(f"   Cashback total: R$ 0.025 (5 cartas)")
    
    return card_ids

def test_redeem_cashback(token, card_ids):
    """Teste 2: Resgatar cashback"""
    print("\n" + "="*80)
    print("🧪 TESTE 2: RESGATAR CASHBACK")
    print("="*80)
    
    if not card_ids:
        print("❌ Nenhuma carta para testar")
        return False
    
    card_id = card_ids[0]
    print(f"\n1️⃣ Resgatando cashback da carta {card_id[:8]}...")
    
    response = requests.post(
        f"{FRONTEND_URL}/api/v1/cards/redeem-prize",
        headers={"Authorization": f"Bearer {token}"},
        json={"card_instance_id": card_id}
    )
    
    if response.status_code != 200:
        print(f"❌ Erro ao resgatar: {response.status_code}")
        print(response.text)
        return False
    
    data = response.json()['data']
    print(f"✅ Cashback resgatado!")
    print(f"   Valor: R$ {data['cashback_amount']:.4f}")
    print(f"   Saldo anterior: R$ {data['old_balance']:.2f}")
    print(f"   Novo saldo: R$ {data['new_balance']:.2f}")
    
    # Verificar se carta ainda existe
    print(f"\n2️⃣ Verificando se carta permanece no inventário...")
    card_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/cards_instances?id=eq.{card_id}&select=id,prize_redeemed",
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {token}"
        }
    )
    
    if card_response.status_code == 200 and card_response.json():
        card_data = card_response.json()[0]
        print(f"✅ Carta ainda existe no inventário")
        print(f"   Prize resgatado: {card_data['prize_redeemed']}")
    else:
        print("❌ Carta não encontrada!")
        return False
    
    return True

def test_recycle_for_points(token, card_ids):
    """Teste 3: Reciclar cartas por pontos"""
    print("\n" + "="*80)
    print("🧪 TESTE 3: RECICLAR CARTAS POR PONTOS")
    print("="*80)
    
    if len(card_ids) < 3:
        print("❌ Cartas insuficientes para testar")
        return False
    
    # Reciclar 3 cartas
    cards_to_recycle = card_ids[1:4]  # Pular a primeira que foi resgatada
    print(f"\n1️⃣ Reciclando {len(cards_to_recycle)} cartas...")
    
    response = requests.post(
        f"{FRONTEND_URL}/api/v1/cards/recycle-for-points",
        headers={"Authorization": f"Bearer {token}"},
        json={"card_instance_ids": cards_to_recycle}
    )
    
    if response.status_code != 200:
        print(f"❌ Erro ao reciclar: {response.status_code}")
        print(response.text)
        return False
    
    data = response.json()['data']
    print(f"✅ Cartas recicladas!")
    print(f"   Cartas: {data['cards_recycled']}")
    print(f"   Pontos ganhos: {data['points_earned']}")
    print(f"   Pontos anteriores: {data['previous_points']}")
    print(f"   Total de pontos: {data['total_points']}")
    
    print(f"\n2️⃣ Detalhes das cartas recicladas:")
    for detail in data['recycle_details']:
        print(f"   Raridade: {detail['rarity']} → {detail['points']} pontos")
    
    print(f"\n3️⃣ Boosters disponíveis para troca:")
    for booster in data['affordable_boosters']:
        if booster['can_afford']:
            print(f"   ✅ {booster['tier']}: {booster['cost']} pts (pode comprar {booster['max_quantity']}x)")
    
    # Verificar se cartas foram deletadas
    print(f"\n4️⃣ Verificando se cartas foram deletadas...")
    for card_id in cards_to_recycle:
        card_response = requests.get(
            f"{SUPABASE_URL}/rest/v1/cards_instances?id=eq.{card_id}",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {token}"
            }
        )
        
        if card_response.status_code == 200 and not card_response.json():
            print(f"   ✅ Carta {card_id[:8]}... deletada")
        else:
            print(f"   ❌ Carta {card_id[:8]}... ainda existe!")
    
    return data['total_points']

def test_exchange_points(token, total_points):
    """Teste 4: Trocar pontos por booster"""
    print("\n" + "="*80)
    print("🧪 TESTE 4: TROCAR PONTOS POR BOOSTER")
    print("="*80)
    
    if not total_points or total_points < 50:
        print(f"❌ Pontos insuficientes ({total_points}). Precisa de 50 para Básico.")
        return False
    
    print(f"\n1️⃣ Trocando 50 pontos por booster Básico...")
    print(f"   Pontos disponíveis: {total_points}")
    
    response = requests.post(
        f"{FRONTEND_URL}/api/v1/recycle/exchange",
        headers={"Authorization": f"Bearer {token}"},
        json={"booster_tier": "Básico"}
    )
    
    if response.status_code != 200:
        print(f"❌ Erro na troca: {response.status_code}")
        print(response.text)
        return False
    
    data = response.json()['data']
    print(f"✅ Troca realizada!")
    print(f"   Pontos gastos: {data['points_spent']}")
    print(f"   Pontos restantes: {data['remaining_points']}")
    print(f"   Booster: {data['booster_tier']}")
    print(f"   Opening ID: {data['booster_opening_id']}")
    print(f"   {data['message']}")
    
    return True

def main():
    print("\n" + "="*80)
    print("🧪 TESTE COMPLETO: SISTEMA DE CASHBACK E PONTOS")
    print("="*80)
    
    # Login
    token = login()
    
    # Teste 1: Abrir booster
    card_ids = test_booster_opening(token)
    
    if card_ids:
        # Teste 2: Resgatar cashback
        test_redeem_cashback(token, card_ids)
        
        # Teste 3: Reciclar por pontos
        total_points = test_recycle_for_points(token, card_ids)
        
        # Teste 4: Trocar pontos
        if total_points:
            test_exchange_points(token, total_points)
    
    print("\n" + "="*80)
    print("✅ TESTES CONCLUÍDOS")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()
