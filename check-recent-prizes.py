#!/usr/bin/env python3
"""Verifica os últimos prêmios registrados no sistema"""

import requests

# Configuração
SUPABASE_URL = "https://mmcytphoeyxeylvaqjgr.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3l0cGhvZXl4ZXlsdmFxamdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTQyMjAsImV4cCI6MjA3OTY5MDIyMH0.i1bcSAGL_J-vxc6gxwXZZxfn7GJl8puL5eYwe9UkZAs"

print("\n" + "="*80)
print("🎰 ÚLTIMOS 10 PRÊMIOS REGISTRADOS NO SISTEMA")
print("="*80 + "\n")

headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    'Content-Type': 'application/json'
}

response = requests.get(
    f"{SUPABASE_URL}/rest/v1/booster_prizes?select=*&order=created_at.desc&limit=10",
    headers=headers
)

if response.status_code != 200:
    print(f"❌ Erro ao buscar prêmios: {response.status_code}")
    print(response.text)
    exit(1)

prizes = response.json()

if not prizes:
    print("❌ Nenhum prêmio encontrado!")
else:
    for i, prize in enumerate(prizes, 1):
        print(f"{i}. Opening: {prize['opening_id'][:13] if prize['opening_id'] else 'N/A'}...")
        print(f"   💰 Prêmio: R$ {prize['prize_amount_brl']:.2f}")
        print(f"   📊 RTP: {prize['rtp_percentage']:.1f}%")
        print(f"   🎯 Tier: {prize['prize_tier']}")
        print(f"   🕐 Criado: {prize['created_at']}")
        print()

print("="*80)
print(f"Total de prêmios: {len(prizes)}")
print("="*80 + "\n")
