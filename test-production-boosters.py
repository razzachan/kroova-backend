#!/usr/bin/env python3
"""
Script de teste de produção - Validar RTP e distribuição de raridades
Testa comprando 1 booster de cada tier e verificando valores
"""

import requests
import json
from datetime import datetime

# Configuração
SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTQyMjAsImV4cCI6MjA3OTY5MDIyMH0.i1bcSAGL_J-vxc6gxwXZZxfn7GJl8puL5eYwe9UkZAs"
FRONTEND_URL = "https://frontend-7efzij7zx-razzachans-projects.vercel.app"  # FINAL - Clean version

EMAIL = "akroma.julio@gmail.com"
PASSWORD = "Akroma!t8g86v8t!3159"

# Tiers para testar
TIERS_TO_TEST = [
    {"name": "Básico", "price": 0.50},
    {"name": "Padrão", "price": 1.00},
    {"name": "Premium", "price": 2.00},
    {"name": "Elite", "price": 5.00},
    {"name": "Whale", "price": 10.00}
]

def login():
    """Fazer login e retornar access_token"""
    print(f"\n🔐 Fazendo login como {EMAIL}...")
    
    response = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        },
        json={
            "email": EMAIL,
            "password": PASSWORD
        }
    )
    
    if response.status_code != 200:
        print(f"❌ Erro no login: {response.status_code}")
        print(response.text)
        return None
    
    data = response.json()
    access_token = data.get("access_token")
    print(f"✅ Login realizado! Token: {access_token[:20]}...")
    return access_token

def get_available_boosters(access_token):
    """Listar boosters disponíveis"""
    print(f"\n📦 Buscando boosters disponíveis...")
    
    response = requests.get(
        f"{FRONTEND_URL}/api/v1/boosters",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
    )
    
    if response.status_code != 200:
        print(f"❌ Erro ao buscar boosters: {response.status_code}")
        print(response.text)
        return []
    
    data = response.json()
    # API pode retornar lista direto ou objeto com "data"
    if isinstance(data, list):
        boosters = data
    elif isinstance(data, dict) and "data" in data:
        boosters = data["data"].get("boosters", data["data"]) if isinstance(data["data"], dict) else data["data"]
    else:
        boosters = []
    print(f"✅ Encontrados {len(boosters)} boosters")
    return boosters

def buy_booster(access_token, booster_id, price):
    """Comprar um booster"""
    print(f"\n💳 Comprando booster ID {booster_id} (R$ {price})...")
    
    response = requests.post(
        f"{FRONTEND_URL}/api/v1/boosters/purchase",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        },
        json={
            "booster_type_id": booster_id,
            "quantity": 1
        }
    )
    
    if response.status_code != 200:
        print(f"❌ Erro na compra: {response.status_code}")
        print(response.text)
        return None
    
    data = response.json()
    boosters = data.get("data", {}).get("boosters", [])
    if boosters and len(boosters) > 0:
        opening_id = boosters[0].get("id")
        print(f"✅ Compra realizada! Opening ID: {opening_id}")
        return opening_id
    else:
        print(f"❌ Nenhum booster retornado na compra")
        print(f"Response: {json.dumps(data, indent=2)}")
        return None

def open_booster(access_token, opening_id):
    """Abrir booster e retornar cartas"""
    print(f"\n🎁 Abrindo booster {opening_id}...")
    
    response = requests.post(
        f"{FRONTEND_URL}/api/v1/boosters/open",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        },
        json={
            "opening_id": opening_id
        }
    )
    
    if response.status_code != 200:
        print(f"❌ Erro ao abrir: {response.status_code}")
        print(response.text)
        return None
    
    data = response.json()
    cards = data.get("data", {}).get("cards", [])
    print(f"✅ Booster aberto! {len(cards)} cartas recebidas")
    return cards

def analyze_cards(cards, tier_name, tier_price):
    """Analisar cartas e validar valores"""
    print(f"\n📊 ANÁLISE DO TIER {tier_name.upper()} (R$ {tier_price})")
    print("=" * 70)
    
    total_value = 0
    rarities = {}
    issues = []
    
    for i, card in enumerate(cards, 1):
        # API retorna card.card.rarity, não card.rarity
        card_data = card.get("card", {})
        rarity = card_data.get("rarity", "unknown")
        liquidity = card.get("liquidity_brl", 0)
        skin = card.get("skin", "default")
        name = card_data.get("name", "Unknown")
        
        total_value += liquidity
        rarities[rarity] = rarities.get(rarity, 0) + 1
        
        print(f"  Carta {i}: {name}")
        print(f"    Raridade: {rarity} | Skin: {skin} | Valor: R$ {liquidity:.2f}")
        
        # Validações
        if liquidity > 1000:
            issues.append(f"Carta {i} tem valor absurdo: R$ {liquidity:.2f}")
        
        if liquidity < 0.01:
            issues.append(f"Carta {i} tem valor abaixo do mínimo: R$ {liquidity:.2f}")
    
    rtp = (total_value / tier_price) * 100 if tier_price > 0 else 0
    
    print(f"\n  📈 RESUMO:")
    print(f"    Total recebido: R$ {total_value:.2f}")
    print(f"    RTP Real: {rtp:.1f}%")
    print(f"    Distribuição: {rarities}")
    
    # Validação de RTP - LIMIAR 62-72% PARA TODOS OS TIERS
    if rtp < 62:
        issues.append(f"RTP abaixo do limiar mínimo: {rtp:.1f}% (esperado 62-72%)")
    elif rtp > 72:
        issues.append(f"RTP acima do limiar máximo: {rtp:.1f}% (esperado 62-72%)")
    
    # Validação de raridades
    if tier_name == "Whale":
        viral_count = rarities.get("viral", 0)
        legendary_count = rarities.get("legendary", 0)
        if viral_count > 2:
            issues.append(f"Muitos virais no Whale: {viral_count} (deveria ser <2)")
        if legendary_count < 2:
            issues.append(f"Poucos legendaries no Whale: {legendary_count} (deveria ser ≥3)")
    
    if issues:
        print(f"\n  ⚠️  PROBLEMAS ENCONTRADOS:")
        for issue in issues:
            print(f"    - {issue}")
        return False
    else:
        print(f"\n  ✅ Tier validado com sucesso!")
        return True

def main():
    print("=" * 70)
    print("🧪 TESTE DE PRODUÇÃO - KROOVA TCG")
    print("=" * 70)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Login
    access_token = login()
    if not access_token:
        print("\n❌ Falha no login. Abortando.")
        return
    
    # Buscar boosters
    boosters = get_available_boosters(access_token)
    if not boosters:
        print("\n❌ Nenhum booster disponível. Abortando.")
        return
    
    # Mapear boosters por preço
    booster_map = {}
    for booster in boosters:
        price = booster.get("price_brl")
        if price not in booster_map:
            booster_map[price] = booster
    
    # Testar cada tier
    results = {}
    for tier in TIERS_TO_TEST:
        tier_name = tier["name"]
        tier_price = tier["price"]
        
        print(f"\n{'=' * 70}")
        print(f"🎯 TESTANDO TIER: {tier_name} (R$ {tier_price})")
        print(f"{'=' * 70}")
        
        # Encontrar booster do tier
        booster = booster_map.get(tier_price)
        if not booster:
            print(f"⚠️  Booster do tier {tier_name} não encontrado, pulando...")
            results[tier_name] = "SKIPPED"
            continue
        
        booster_id = booster.get("id")
        
        # Comprar booster
        opening_id = buy_booster(access_token, booster_id, tier_price)
        if not opening_id:
            print(f"❌ Falha na compra do tier {tier_name}")
            results[tier_name] = "FAILED_PURCHASE"
            continue
        
        # Abrir booster
        cards = open_booster(access_token, opening_id)
        if not cards:
            print(f"❌ Falha ao abrir booster do tier {tier_name}")
            results[tier_name] = "FAILED_OPEN"
            continue
        
        # Analisar cartas
        is_valid = analyze_cards(cards, tier_name, tier_price)
        results[tier_name] = "PASSED" if is_valid else "FAILED_VALIDATION"
    
    # Relatório final
    print("\n" + "=" * 70)
    print("📋 RELATÓRIO FINAL")
    print("=" * 70)
    
    for tier_name, result in results.items():
        emoji = "✅" if result == "PASSED" else "❌"
        print(f"  {emoji} {tier_name}: {result}")
    
    passed = sum(1 for r in results.values() if r == "PASSED")
    total = len(results)
    
    print(f"\n  Total: {passed}/{total} tiers validados")
    
    if passed == total:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
    else:
        print("\n⚠️  ALGUNS TESTES FALHARAM - REVISAR CONFIGURAÇÕES")

if __name__ == "__main__":
    main()
