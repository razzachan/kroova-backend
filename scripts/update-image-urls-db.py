#!/usr/bin/env python3
"""
Update cards_base.image_url to point to Supabase Storage CDN
"""
import os
import sys
from dotenv import load_dotenv
import requests

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def main():
    print("🔄 Updating image_url in database...")
    print("=" * 70)
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Missing Supabase credentials")
        sys.exit(1)
    
    # Get Supabase project URL for storage
    project_ref = SUPABASE_URL.split('//')[1].split('.')[0]
    storage_base = f"https://{project_ref}.supabase.co/storage/v1/object/public/card-images"
    
    # Get all cards that don't have Supabase Storage URLs
    url = f"{SUPABASE_URL}/rest/v1/cards_base"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
    }
    params = {
        'select': 'display_id,image_url',
    }
    
    res = requests.get(url, headers=headers, params=params)
    
    if not res.ok:
        print(f"❌ Failed to fetch cards: {res.status_code}")
        sys.exit(1)
    
    all_cards = res.json()
    # Filter cards that need update (not already pointing to Supabase Storage)
    cards = [c for c in all_cards if c.get('image_url') and storage_base not in c['image_url']]
    
    print(f"📊 Found {len(cards)} cards needing URL update")
    
    if not cards:
        print("✅ All cards already have Supabase Storage URLs")
        return
    
    # Update each card
    updated = 0
    failed = 0
    
    for card in cards:
        display_id = card['display_id']
        new_url = f"{storage_base}/{display_id}.png"
        
        update_url = f"{SUPABASE_URL}/rest/v1/cards_base"
        update_params = {'display_id': f'eq.{display_id}'}
        payload = {'image_url': new_url}
        
        try:
            res = requests.patch(update_url, headers=headers, params=update_params, json=payload)
            res.raise_for_status()
            print(f"✅ {display_id}")
            updated += 1
        except Exception as e:
            print(f"❌ {display_id}: {e}")
            failed += 1
    
    print("\n" + "=" * 70)
    print(f"✅ Updated: {updated}")
    print(f"❌ Failed: {failed}")
    print("\n✅ All cards now point to Supabase CDN:")
    print(f"   {SUPABASE_URL}/storage/v1/object/public/card-images/{{display_id}}.png")


if __name__ == '__main__':
    main()
