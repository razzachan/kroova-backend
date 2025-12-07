#!/usr/bin/env python3
"""
Teste de RTP com múltiplas amostras para calcular média estatística
"""

import requests
import json
from datetime import datetime

# Config
API_BASE = "https://frontend-3psxfgumo-razzachans-projects.vercel.app/api/v1"
EMAIL = "akroma.julio@gmail.com"
PASSWORD = "123456"

# Quantas amostras por tier
SAMPLES_PER_TIER = 5

def login():
    """Faz login e retorna o token"""
    auth_url = "https://mmcytphoeyxeylvaqjgr.supabase.co/auth/v1/token?grant_type=password"
    headers = {
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTQyMjAsImV4cCI6MjA3OTY5MDIyMH0.UTW-XwzwH5AqD8u7XLw8LlILWkrcKGkqh-BzvfFOoHk",
        "Content-Type": "application/json"
    }
    
    data = {
        "email": EMAIL,
        "password": PASSWORD
    }
    
    response = requests.post(auth_url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        raise Exception(f"Login falhou: {response.text}")

def get_boosters(token):
    """Lista boosters disponíveis"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE}/boosters", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if isinstance(data.get("data"), list):
            return data["data"]
        elif isinstance(data.get("data"), dict) and "boosters" in data["data"]:
            return data["data"]["boosters"]
        else:
            return data.get("data", [])
    return []

def buy_booster(booster_id, token):
    """Compra um booster"""
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    data = {"booster_id": booster_id}
    
    response = requests.post(f"{API_BASE}/boosters/purchase", headers=headers, json=data)
    if response.status_code == 200:
        result = response.json()
        boosters = result.get("data", {}).get("boosters", [])
        if boosters:
            return boosters[0].get("id")
    return None

def open_booster(opening_id, token):
    """Abre um booster"""
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    data = {"opening_id": opening_id}
    
    response = requests.post(f"{API_BASE}/boosters/open", headers=headers, json=data)
    if response.status_code == 200:
        return response.json().get("data", {}).get("cards", [])
    return []

def calculate_rtp(cards, booster_price):
    """Calcula RTP"""
    total = sum(card.get("liquidity_brl", 0) for card in cards)
    rtp = (total / booster_price) * 100 if booster_price > 0 else 0
    return total, rtp

def test_tier_multiple(tier_name, price, booster_id, token, samples=5):
    """Testa um tier múltiplas vezes"""
    print(f"\n{'='*70}")
    print(f"🎯 TESTANDO: {tier_name} (R$ {price:.2f}) - {samples} amostras")
    print(f"{'='*70}")
    
    rtps = []
    totals = []
    
    for i in range(samples):
        print(f"\n  Amostra {i+1}/{samples}...")
        
        # Comprar
        opening_id = buy_booster(booster_id, token)
        if not opening_id:
            print(f"  ❌ Erro ao comprar")
            continue
        
        # Abrir
        cards = open_booster(opening_id, token)
        if not cards:
            print(f"  ❌ Erro ao abrir")
            continue
        
        # Calcular
        total, rtp = calculate_rtp(cards, price)
        rtps.append(rtp)
        totals.append(total)
        
        print(f"  💰 Total: R$ {total:.2f} | RTP: {rtp:.1f}%")
    
    # Estatísticas
    if rtps:
        avg_rtp = sum(rtps) / len(rtps)
        min_rtp = min(rtps)
        max_rtp = max(rtps)
        
        print(f"\n  📊 ESTATÍSTICAS:")
        print(f"    Média RTP: {avg_rtp:.1f}%")
        print(f"    Mínimo: {min_rtp:.1f}% | Máximo: {max_rtp:.1f}%")
        
        # Validação
        if 62 <= avg_rtp <= 72:
            print(f"    ✅ DENTRO DO LIMIAR (62-72%)")
            status = "PASS"
        else:
            print(f"    ⚠️  FORA DO LIMIAR (esperado 62-72%)")
            status = "FAIL"
        
        return {
            "tier": tier_name,
            "price": price,
            "avg_rtp": avg_rtp,
            "min_rtp": min_rtp,
            "max_rtp": max_rtp,
            "samples": len(rtps),
            "status": status
        }
    
    return None

def main():
    print("="*70)
    print("🧪 TESTE DE RTP - MÚLTIPLAS AMOSTRAS")
    print("="*70)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Amostras por tier: {SAMPLES_PER_TIER}")
    
    # Login
    print("\n🔐 Fazendo login...")
    token = login()
    print("✅ Login realizado!")
    
    # Buscar boosters
    print("\n📦 Buscando boosters...")
    boosters = get_boosters(token)
    
    # Agrupar por tier
    tiers = {
        "Básico": [],
        "Padrão": [],
        "Premium": [],
        "Elite": [],
        "Whale": []
    }
    
    for b in boosters:
        name = b.get("name", "")
        for tier in tiers.keys():
            if tier in name:
                tiers[tier].append(b)
                break
    
    # Testar cada tier (pegar o primeiro booster de cada)
    results = []
    
    for tier, boosters_list in tiers.items():
        if boosters_list:
            booster = boosters_list[0]
            result = test_tier_multiple(
                tier,
                booster.get("price_brl", 0),
                booster.get("id"),
                token,
                SAMPLES_PER_TIER
            )
            if result:
                results.append(result)
    
    # Relatório final
    print("\n" + "="*70)
    print("📋 RELATÓRIO FINAL")
    print("="*70)
    
    passed = 0
    failed = 0
    
    for r in results:
        status_icon = "✅" if r["status"] == "PASS" else "❌"
        print(f"{status_icon} {r['tier']}: {r['avg_rtp']:.1f}% "
              f"(min: {r['min_rtp']:.1f}%, max: {r['max_rtp']:.1f}%) "
              f"- {r['samples']} amostras")
        
        if r["status"] == "PASS":
            passed += 1
        else:
            failed += 1
    
    print(f"\n✅ PASSOU: {passed}/5 tiers")
    print(f"❌ FALHOU: {failed}/5 tiers")
    
    if failed == 0:
        print("\n🎉 TODOS OS TIERS DENTRO DO LIMIAR 62-72%!")
    else:
        print("\n⚠️  ALGUNS TIERS PRECISAM DE AJUSTE")

if __name__ == "__main__":
    main()
