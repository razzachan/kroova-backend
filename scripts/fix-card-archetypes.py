#!/usr/bin/env python3
"""
Fix Kroova card archetype encoding issues in Supabase.

Detects mojibake (Ã sequences, replacement chars) in `archetype` and repairs to canonical forms.

Canonical archetypes:
  Ganância, Influência, Impulso, Informação, Consumo, Preguiça

Usage:
  Dry run:  python fix-card-archetypes.py
  Apply:    python fix-card-archetypes.py --apply

Environment:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
"""

import os
import sys
import re
import unicodedata
from typing import Dict, List, Tuple
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
if not SUPABASE_URL or not SERVICE_KEY:
    print("❌ Missing Supabase env vars.")
    sys.exit(1)

ENDPOINT = f"{SUPABASE_URL}/rest/v1/cards_base"

CANONICAL = {
    'ganância': 'Ganância',
    'influência': 'Influência',
    'impulso': 'Impulso',
    'informação': 'Informação',
    'consumo': 'Consumo',
    'preguiça': 'Preguiça',
}

BROKEN_MAP = {
    # common mojibake variants -> canonical
    'ganãncia': 'Ganância',
    'ganâcia': 'Ganância',
    'gananca': 'Ganância',
    'influência': 'Influência',  # already canonical lowercase
    'influência ': 'Influência',
    'influÃªncia': 'Influência',
    'influencia': 'Influência',
    'impulso': 'Impulso',
    'impulÃ§o': 'Impulso',
    'informaçÃ£o': 'Informação',
    'informaçao': 'Informação',
    'informacao': 'Informação',
    'consumo': 'Consumo',
    'consûmo': 'Consumo',
    'preguiça': 'Preguiça',
    'preguicÃ£': 'Preguiça',
    'preguica': 'Preguiça',
}

MOJIBAKE = re.compile(r"Ã.|�")

def fetch_cards() -> List[Dict]:
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
    }
    params = { 'select': 'display_id,archetype' }
    r = requests.get(ENDPOINT, headers=headers, params=params)
    r.raise_for_status()
    cards = r.json()
    return [c for c in cards if 'crd_' in (c.get('display_id') or '')]

def normalize(text: str) -> str:
    text = unicodedata.normalize('NFKC', text.strip())
    return text

def detect_issue(archetype: str) -> Tuple[bool,str]:
    if not archetype:
        return True, 'empty'
    norm = normalize(archetype)
    low = norm.lower()
    if low in CANONICAL and norm == CANONICAL[low]:
        return False, ''  # ok
    if MOJIBAKE.search(norm):
        return True, 'mojibake'
    if low not in CANONICAL:
        return True, 'non_canonical'
    if norm != CANONICAL[low]:
        return True, 'case_or_accent'
    return False, ''

def repair(archetype: str) -> str:
    if not archetype:
        return ''
    norm = normalize(archetype)
    low = norm.lower()
    if low in CANONICAL:
        return CANONICAL[low]
    if low in BROKEN_MAP:
        return BROKEN_MAP[low]
    # Try latin-1 roundtrip if mojibake present
    if 'Ã' in norm or '�' in norm:
        try:
            b = norm.encode('latin-1', errors='replace')
            rec = b.decode('utf-8', errors='replace')
            rec_norm = normalize(rec)
            low2 = rec_norm.lower()
            if low2 in CANONICAL:
                return CANONICAL[low2]
        except Exception:
            pass
    return norm  # fallback

def build_updates(cards: List[Dict]) -> List[Tuple[str,str,str,str]]:
    updates = []  # display_id, old, new, issue
    for c in cards:
        old = c.get('archetype') or ''
        display_id = c.get('display_id') or ''
        needs, issue = detect_issue(old)
        if needs:
            new = repair(old)
            if new and new != old:
                updates.append((display_id, old, new, issue))
    return updates

def apply_updates(updates: List[Tuple[str,str,str,str]]) -> None:
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    for display_id, old, new, issue in updates:
        params = { 'display_id': f'eq.{display_id}' }
        payload = { 'archetype': new }
        try:
            r = requests.patch(ENDPOINT, headers=headers, params=params, json=payload)
            r.raise_for_status()
            print(f"✅ {display_id}: '{old}' -> '{new}' ({issue})")
        except requests.RequestException as e:
            print(f"❌ {display_id}: failed to update ({issue}) {e}")

def main():
    apply = '--apply' in sys.argv
    print('🔍 Fetching archetypes...')
    cards = fetch_cards()
    print(f'   Cards fetched: {len(cards)}')
    updates = build_updates(cards)
    if not updates:
        print('✅ No archetype issues detected. Nothing to do.')
        return
    print(f"⚠️  Will repair {len(updates)} archetype values:")
    for d, old, new, issue in updates[:30]:
        print(f"   • {d}: '{old}' -> '{new}' ({issue})")
    if len(updates) > 30:
        print(f"   ... (+{len(updates)-30} more)")
    if not apply:
        print('\nDry run complete. Re-run with --apply to persist changes.')
        return
    print('\n🚀 Applying archetype fixes...')
    apply_updates(updates)
    print('\n✅ Done.')

if __name__ == '__main__':
    main()
