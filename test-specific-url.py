#!/usr/bin/env python3
"""Testa o endpoint específico do Vercel para verificar se CAP está aplicado"""

import requests
import json

# URL do último deploy
BASE_URL = "https://frontend-gze4ifx13-razzachans-projects.vercel.app"

# Auth
auth_resp = requests.post(f"{BASE_URL}/api/v1/auth", json={
    "email": "akroma.julio@gmail.com",
    "password": "Senha123!"
})
token = auth_resp.json()["token"]
headers = {"Authorization": f"Bearer {token}"}

# Get Whale booster
boosters_resp = requests.get(f"{BASE_URL}/api/v1/boosters", headers=headers)
boosters = boosters_resp.json()
whale = [b for b in boosters if "Whale" in b["name"]][0]

print(f"\n🎯 Testando Whale booster na URL: {BASE_URL}\n")

# Purchase
purchase_resp = requests.post(
    f"{BASE_URL}/api/v1/boosters/purchase",
    json={"boosterTypeId": whale["id"]},
    headers=headers
)
opening_id = purchase_resp.json()["openingId"]
print(f"✅ Comprado! Opening ID: {opening_id}")

# Open
open_resp = requests.post(
    f"{BASE_URL}/api/v1/boosters/open",
    json={"openingId": opening_id},
    headers=headers
)
result = open_resp.json()

print(f"\n📦 CARTAS RECEBIDAS:\n")
total = 0
for i, card in enumerate(result["cards"], 1):
    name = card["card"]["name"]
    rarity = card["rarity"]
    skin = card["skin"]
    liquidity = card["liquidity_brl"]
    total += liquidity
    
    # Verificar se CAP foi aplicado
    cap_status = "✅ CAP OK" if liquidity <= 7.00 else f"❌ EXCEDEU CAP (max R$ 7.00)"
    
    print(f"  {i}. {name:20s} | {rarity:10s} | {skin:8s} | R$ {liquidity:7.2f} | {cap_status}")

rtp = (total / 10.0) * 100
print(f"\n💰 TOTAL: R$ {total:.2f}")
print(f"📊 RTP: {rtp:.1f}%")
print(f"🎯 STATUS: {'✅ DENTRO DO LIMIAR' if 62 <= rtp <= 72 else '❌ FORA DO LIMIAR (62-72%)'}")
