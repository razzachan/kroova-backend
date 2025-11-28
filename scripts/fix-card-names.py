#!/usr/bin/env python3
"""
Fix Kroova card name encoding issues in Supabase.

Some names were double-encoded or mis-decoded (e.g., "GanÃ¢ncia" instead of "Ganância").
This script detects problematic patterns (replacement chars, Latin-1 mojibake sequences like "Ã¡")
and attempts a safe repair by reinterpreting the string as Latin-1 bytes and decoding as UTF-8.

Usage:
  Dry run (no changes):
    python fix-card-names.py

  Apply fixes:
    python fix-card-names.py --apply

Environment variables required:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY  (service role for write access)

Safety:
  - Only modifies rows whose name is demonstrably broken.
  - Keeps an audit log printed to console.
  - Skips names already correct or that fail safe-repair sanity checks.
"""

import os
import sys
import re
import unicodedata
from typing import Dict, List, Tuple
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_KEY:
    print("❌ Missing Supabase environment variables.")
    sys.exit(1)

CARDS_ENDPOINT = f"{SUPABASE_URL}/rest/v1/cards_base"

# Regex patterns for detecting mojibake / broken names
MOJIBAKE_FRAGMENT = re.compile(r"Ã.|�")  # sequences like Ã¡, Ã£, Ã© or replacement char
ONLY_ASCII_ACCENTED_PROXY = re.compile(r"Ã[\x80-\xBF]")

def fetch_cards() -> List[Dict]:
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Accept': 'application/json',
    }
    params = {
        'select': 'display_id,name'
    }
    r = requests.get(CARDS_ENDPOINT, headers=headers, params=params)
    r.raise_for_status()
    cards = r.json()
    # Filter probable ED set if needed
    return [c for c in cards if 'crd_' in (c.get('display_id') or '')]

def looks_broken(name: str) -> bool:
    if not name:
        return False
    # Heuristic: contains mojibake fragments OR replacement char
    return bool(MOJIBAKE_FRAGMENT.search(name))

def attempt_repair(name: str) -> str:
    """Try to fix a mojibake string by Latin-1 roundtrip. If repair fails, return original."""
    try:
        # If it already normalizes without change and has no mojibake pattern, skip
        if not looks_broken(name):
            return name
        raw_bytes = name.encode('latin-1', errors='replace')  # interpret current chars as Latin-1 bytes
        repaired = raw_bytes.decode('utf-8', errors='replace')
        # Additional normalization
        repaired_norm = unicodedata.normalize('NFC', repaired)
        # Sanity: repaired must contain at least one proper accented char if original had mojibake
        if any(ch in repaired_norm for ch in 'áãâéêíóõôúçÁÃÂÉÊÍÓÕÔÚÇ'):
            # Remove lingering replacement chars
            repaired_norm = repaired_norm.replace('�', '')
            return repaired_norm.strip()
        # Fallback: if no accented char produced, keep original
        return name
    except Exception:
        return name

def build_updates(cards: List[Dict]) -> List[Tuple[str,str,str]]:
    updates = []  # (display_id, old_name, new_name)
    for c in cards:
        display_id = c.get('display_id') or ''
        old_name = c.get('name') or ''
        if not display_id:
            continue
        if looks_broken(old_name):
            new_name = attempt_repair(old_name)
            if new_name != old_name and new_name:
                updates.append((display_id, old_name, new_name))
    return updates

def apply_updates(updates: List[Tuple[str,str,str]]) -> None:
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    for display_id, old_name, new_name in updates:
        params = { 'display_id': f'eq.{display_id}' }
        payload = { 'name': new_name }
        try:
            r = requests.patch(CARDS_ENDPOINT, headers=headers, params=params, json=payload)
            r.raise_for_status()
            print(f"✅ {display_id}: '{old_name}' -> '{new_name}'")
        except requests.RequestException as e:
            print(f"❌ {display_id}: failed to update. {e}")

def main():
    apply = '--apply' in sys.argv
    print("🔍 Fetching cards...")
    cards = fetch_cards()
    print(f"   Total fetched: {len(cards)}")

    print("🔎 Detecting broken names...")
    updates = build_updates(cards)
    if not updates:
        print("✅ No broken names detected. Nothing to do.")
        return

    print(f"⚠️  Will repair {len(updates)} names:")
    for display_id, old_name, new_name in updates[:25]:  # show sample
        print(f"   • {display_id}: '{old_name}' -> '{new_name}'")
    if len(updates) > 25:
        print(f"   ... (+{len(updates)-25} more)")

    if not apply:
        print("\nDry run complete. Re-run with --apply to persist changes.")
        return

    print("\n🚀 Applying fixes...")
    apply_updates(updates)
    print("\n✅ Done.")

if __name__ == '__main__':
    main()
