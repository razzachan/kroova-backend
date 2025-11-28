#!/usr/bin/env python3
"""
Scan and optionally fix encoding issues in `cards_base.description`.

Detects:
 - Mojibake sequences (Ãx), replacement char (�)
 - Control characters (0x00-0x1F except \t\n\r)
 - Excessive whitespace

Fix strategy (apply mode):
 - Attempt latin-1 -> utf-8 re-decode when mojibake/replacement is present
 - Remove control chars, collapse spaces
 - Keep original if repair yields empty or identical

Usage:
  Dry run  : python fix-card-descriptions.py
  Apply    : python fix-card-descriptions.py --apply
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
    print('❌ Missing Supabase env vars')
    sys.exit(1)

ENDPOINT = f"{SUPABASE_URL}/rest/v1/cards_base"

CTRL = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]")
MOJI = re.compile(r"Ã.|�")

def fetch() -> List[Dict]:
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
    }
    params = { 'select': 'display_id,description' }
    r = requests.get(ENDPOINT, headers=headers, params=params)
    r.raise_for_status()
    rows = r.json()
    return [r for r in rows if 'crd_' in (r.get('display_id') or '')]

def has_issue(text: str) -> Tuple[bool, List[str]]:
    issues = []
    if text is None:
        return True, ['null']
    t = unicodedata.normalize('NFKC', str(text))
    if MOJI.search(t):
        issues.append('mojibake')
    if CTRL.search(t):
        issues.append('control_chars')
    if re.search(r"\s{2,}", t):
        issues.append('double_spaces')
    return (len(issues) > 0), issues

def repair(text: str) -> str:
    if text is None:
        return ''
    t = unicodedata.normalize('NFKC', str(text))
    if 'Ã' in t or '�' in t:
        try:
            b = t.encode('latin-1', errors='replace')
            t = b.decode('utf-8', errors='replace')
        except Exception:
            pass
    t = unicodedata.normalize('NFC', t)
    t = CTRL.sub('', t)
    t = re.sub(r"\s+", ' ', t).strip()
    return t

def build_updates(rows: List[Dict]) -> List[Tuple[str,str,str,List[str]]]:
    out = []
    for r in rows:
        did = r.get('display_id') or ''
        old = r.get('description') or ''
        need, issues = has_issue(old)
        if need:
            new = repair(old)
            if new and new != old:
                out.append((did, old, new, issues))
    return out

def apply_updates(updates: List[Tuple[str,str,str,List[str]]]):
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    for did, old, new, issues in updates:
        params = { 'display_id': f'eq.{did}' }
        payload = { 'description': new }
        try:
            r = requests.patch(ENDPOINT, headers=headers, params=params, json=payload)
            r.raise_for_status()
            print(f"✅ {did}: fixed ({','.join(issues)})")
        except requests.RequestException as e:
            print(f"❌ {did}: failed to update ({','.join(issues)}) {e}")

def main():
    apply = '--apply' in sys.argv
    print('🔍 Scanning descriptions...')
    rows = fetch()
    print(f'   Cards fetched: {len(rows)}')
    updates = build_updates(rows)
    if not updates:
        print('✅ No description issues detected.')
        return
    print(f"⚠️  Will repair {len(updates)} descriptions:")
    for did, old, new, issues in updates[:15]:
        print(f"   • {did}: issues={','.join(issues)}")
    if len(updates) > 15:
        print(f"   ... (+{len(updates)-15} more)")
    if not apply:
        print('\nDry run complete. Re-run with --apply to persist changes.')
        return
    print('\n🚀 Applying description fixes...')
    apply_updates(updates)
    print('\n✅ Done.')

if __name__ == '__main__':
    main()
