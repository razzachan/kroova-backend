#!/usr/bin/env python3
"""
KROUVA Section Icons Generator
Generates themed cyberpunk icons for Wallet, Cards, Marketplace, and Boosters
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    print("❌ GOOGLE_API_KEY not set")
    sys.exit(1)

try:
    from google import genai
    from PIL import Image
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    sys.exit(1)

client = genai.Client(api_key=GOOGLE_API_KEY)

ICON_CONFIGS = {
    'wallet': {
        'prompt': """
3D holographic wallet icon, digital vault with neon cyan and gold glow,
floating geometric shapes representing currency, circuit patterns,
metallic chrome surface with holographic accents, depth and shadows,
cyberpunk style, futuristic financial interface, black background,
ultra detailed 8k, isometric view, glowing data streams
        """.strip(),
        'output': 'icon_wallet.png',
        'emoji_alt': '💰'
    },
    'cards': {
        'prompt': """
Isolated 3D holographic trading card on pure transparent background.
Single card with magenta and cyan neon edges, metallic chrome corners.
Geometric pattern on card surface, slight tilt for depth.
Only the card object, no background elements, no particles, no floor.
Clean cutout, alpha channel transparency around the card.
Cyberpunk style, isometric view, 8k quality.
        """.strip(),
        'output': 'icon_cards.png',
        'emoji_alt': '🃏'
    },
    'marketplace': {
        'prompt': """
Isolated 3D holographic shopping cart or store icon on pure transparent background.
Metallic chrome with neon cyan glow edges, circuit pattern details.
Digital bazaar symbol, geometric interface elements on surface.
Only the main icon object, no background elements, no particles, no floor.
Clean cutout, alpha channel transparency around the object.
Cyberpunk style, isometric view, 8k quality.
        """.strip(),
        'output': 'icon_marketplace.png',
        'emoji_alt': '🛒'
    },
    'boosters': {
        'prompt': """
Isolated 3D holographic booster pack on pure transparent background.
Sealed pack with magenta and gold neon glow edges, metallic chrome wrapper.
Circuit pattern details on surface, crystalline structure, unopened.
Only the pack object, no background elements, no particles, no floor, no aura outside.
Clean cutout, alpha channel transparency around the pack.
Cyberpunk style, isometric view, 8k quality.
        """.strip(),
        'output': 'icon_boosters.png',
        'emoji_alt': '📦'
    }
}

def generate_icon(key: str, config: dict):
    output_path = Path('C:/Kroova/frontend/public') / config['output']
    
    print(f"\n{'='*70}")
    print(f"🎨 Generating: {key} icon")
    print(f"   Output: {output_path}")
    print(f"{'='*70}\n")
    
    try:
        print("⏳ Generating with Imagen 4 Ultra...")
        
        response = client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=config['prompt'],
            config={
                'number_of_images': 1,
                'aspect_ratio': '1:1',
                'person_generation': 'dont_allow',
            }
        )
        
        if not response.generated_images:
            print("❌ No images generated")
            return False
        
        print("✅ Generated! Saving...")
        image = response.generated_images[0].image
        image.save(output_path)
        
        # Create 128x128 thumbnail for UI
        pil_img = Image.open(output_path)
        thumb = pil_img.resize((128, 128), Image.Resampling.LANCZOS)
        thumb_path = Path('C:/Kroova/frontend/public') / config['output'].replace('.png', '_thumb.png')
        thumb.save(thumb_path)
        print(f"   ✅ Thumbnail: {thumb_path}")
        
        print(f"\n✅ SUCCESS: {key} icon generated!")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 KROUVA Section Icons Generator")
    print("="*70)
    
    for key, config in ICON_CONFIGS.items():
        result = generate_icon(key, config)
        if not result:
            print(f"⚠️  Failed to generate {key}, continuing...")
    
    print("\n" + "="*70)
    print("✅ Icon generation complete!")
    print("="*70)
