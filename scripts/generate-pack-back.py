#!/usr/bin/env python3
"""
KROOVA Pack Back Generator
Generates booster pack back designs for each edition using Google Gemini API (Imagen 4)

Usage:
    python generate-pack-back.py --edition ED01
    python generate-pack-back.py --edition ED02 --output-dir frontend/public/packs

Features:
- Edition-specific branding and lore integration
- 3:4 aspect ratio (portrait, optimized for mobile card reveal)
- 2K resolution for crisp displays
- Consistent with KROOVA visual identity
"""

import os
import sys
import argparse
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment
load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    print("❌ GOOGLE_API_KEY not set in environment")
    print("   Add it to .env file: GOOGLE_API_KEY=your_key_here")
    sys.exit(1)

try:
    from google import genai
    from google.genai import types
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    print("   Install with: pip install google-genai python-dotenv")
    sys.exit(1)

# ====== EDITION CONFIGURATIONS ======
EDITIONS = {
    'ED01': {
        'name': 'Colapso da Interface',
        'tagline': 'Se você olhar fixamente para o algoritmo, ele começa a te ver também.',
        'theme': 'Culto ao Algoritmo Vivo',
        'lore': 'Quando o virtual ganha corpo físico e invade o mundo real. Avatar vira entidade. Usuário vira devoto. Trader vira sacerdote. Bug vira profeta. Influencer vira fantasma do desejo coletivo.',
        'visual_mood': 'dystopian cyberpunk, neon worship, glitched reality, digital cult aesthetic',
        'primary_colors': 'neon magenta #FF006D, cyber cyan #00F0FF',
        'accent_colors': 'royal amber #FFC700, digital purple #8B5CF6',
        'keywords': 'algorithm deity, viral sacrifice, attention economy, interface collapse, digital worship, glitch mysticism',
    },
    # Future editions can be added here
    # 'ED02': { ... },
}

# Branding constants (universal across editions)
BRANDING = {
    'aesthetic': 'cyberpunk, neon, glitch, urban dystopian, meme culture, internet-native',
    'colors_base': 'neon magenta (#FF006D), cyber cyan (#00F0FF)',
    'lighting': 'volumetric fog, neon rim lighting, dramatic lighting, holographic glow',
    'atmosphere': 'dystopian cityscape, dark moody, digital interfaces',
    'essence': 'satirical, stylish, internet culture fusion, chaotic but organized',
    'typography': 'bold geometric futuristic font, technological, printed legibility',
}


def build_pack_back_prompt(edition_code: str) -> str:
    """
    Build edition-specific prompt for pack back design
    Integrates branding + lore + technical requirements
    """
    if edition_code not in EDITIONS:
        raise ValueError(f"Unknown edition: {edition_code}. Available: {list(EDITIONS.keys())}")
    
    ed = EDITIONS[edition_code]
    
    prompt = f"""
Create a premium abstract booster pack back design for KROOVA ({edition_code}), a cyberpunk collectible card game.

EDITION THEME: {ed['theme']}
LORE CONTEXT: {ed['lore']}

VISUAL MOOD:
{ed['visual_mood']}

COLOR PALETTE:
- Primary: {ed['primary_colors']}
- Accents: {ed['accent_colors']}
- Base aesthetic: {BRANDING['colors_base']}

BRAND IDENTITY:
- Aesthetic: {BRANDING['aesthetic']}
- Lighting: {BRANDING['lighting']}
- Atmosphere: {BRANDING['atmosphere']}
- Essence: {BRANDING['essence']}

DESIGN REQUIREMENTS:
1. ASPECT RATIO: 3:4 portrait (vertical card orientation)
2. NO TEXT OR WORDS - pure visual abstract design only
3. JUST "KROOVA" subtly integrated as embossed/engraved pattern (not readable text, but as texture/relief)
4. BACKGROUND: Abstract digital glitch patterns, iridescent energy waves, neon gradients, geometric fractals
5. VISUAL ELEMENTS: 
   - Deep embossed/debossed geometric patterns creating 3D relief effect
   - Holographic prismatic textures with depth
   - Layered transparent overlays with glow
   - Volumetric fog with neon rim lighting
   - Cyber grid patterns receding into depth
   - Fragmented pixels and digital artifacts
   - {ed['keywords']} rendered as abstract visual metaphors
6. STYLE: Ultra-premium collectible card pack back, mysterious, high-energy digital aesthetic
7. TEXTURE: Embossed relief, metallic sheen, holographic iridescence, layered depth
8. MOOD: Edgy, stylish, futuristic, slightly chaotic but organized, technologically advanced
9. QUALITY: Photorealistic 4K with exceptional detail and depth

TECHNICAL SPECS:
- No readable text or typography
- No people, faces, or characters
- Symmetrical or centered abstract composition
- High contrast and visual depth through layering
- Premium luxury collectible aesthetic
- Suitable for mobile screens and print
- Must look expensive and collectible

OUTPUT: Ultra high-resolution abstract artwork with embossed relief effects, suitable for premium booster pack back design.
"""
    return prompt


def generate_pack_back(edition: str, output_dir: str = 'frontend/public', model: str = 'imagen-4.0-ultra-generate-001'):
    """
    Generate pack back image using Google Gemini API (Imagen 4 Ultra)
    
    Args:
        edition: Edition code (e.g., 'ED01')
        output_dir: Directory to save the image
        model: Gemini model to use for generation (default: imagen-4.0-ultra-generate)
    """
    print(f"\n🎨 Generating {edition} Pack Back Design")
    print(f"📝 Model: {model}")
    print(f"📏 Size: 1144x1656 (3:4 ratio)")
    print(f"📁 Output: {output_dir}/\n")
    
    # Build prompt
    try:
        prompt = build_pack_back_prompt(edition)
    except ValueError as e:
        print(f"❌ {e}")
        return False
    
    # Initialize Gemini client
    client = genai.Client(api_key=GOOGLE_API_KEY)
    
    try:
        print("⏳ Generating 4K image with Imagen 4 Ultra (10-30 seconds)...")
        start_time = time.time()
        
        # Generate using Imagen 4 Ultra (same as card generation script)
        response = client.models.generate_images(
            model=model,
            prompt=prompt,
            config={
                'number_of_images': 1,
                'aspect_ratio': '3:4',
                'image_size': '2K',
                'person_generation': 'dont_allow',
            }
        )
        
        elapsed = time.time() - start_time
        print(f"✅ Generated in {elapsed:.1f}s")
        
        # Check if image was generated
        if not response.generated_images:
            print("❌ No image generated in response")
            return False
        
        # Save image
        image = response.generated_images[0]
        
        # Create output directory if needed
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Filename: pack-back-{edition}.png
        filename = f"pack-back-{edition.lower()}.png"
        filepath = output_path / filename
        
        # image.image is already a PIL Image object from Gemini API
        image.image.save(filepath)
        
        file_size_kb = filepath.stat().st_size / 1024
        print(f"\n✅ Pack back saved successfully!")
        print(f"📁 Path: {filepath}")
        print(f"💾 Size: {file_size_kb:.2f} KB")
        print(f"🎯 Format: PNG (3:4 ratio)")
        
        # Show edition info
        ed_info = EDITIONS[edition]
        print(f"\n📚 Edition: {ed_info['name']}")
        print(f"🎭 Theme: {ed_info['theme']}")
        print(f"💭 Tagline: {ed_info['tagline']}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error generating pack back: {e}")
        if hasattr(e, 'response'):
            print(f"API Response: {e.response}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Generate KROOVA booster pack back designs',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate-pack-back.py --edition ED01
  python generate-pack-back.py --edition ED01 --output-dir public/assets
  python generate-pack-back.py --edition ED01 --model imagen-4.0-ultra-generate

Available editions: """ + ', '.join(EDITIONS.keys())
    )
    
    parser.add_argument(
        '--edition',
        type=str,
        required=True,
        choices=list(EDITIONS.keys()),
        help='Edition code (e.g., ED01)'
    )
    
    parser.add_argument(
        '--output-dir',
        type=str,
        default='frontend/public',
        help='Output directory (default: frontend/public)'
    )
    
    parser.add_argument(
        '--model',
        type=str,
        default='imagen-4.0-ultra-generate-001',
        help='Gemini model to use (default: imagen-4.0-ultra-generate-001)'
    )
    
    args = parser.parse_args()
    
    # Generate
    success = generate_pack_back(
        edition=args.edition,
        output_dir=args.output_dir,
        model=args.model
    )
    
    if success:
        print("\n🎉 Generation complete!")
        print(f"\nNext steps:")
        print(f"1. Review the image at: {args.output_dir}/pack-back-{args.edition.lower()}.png")
        print(f"2. Update OpeningSession.tsx to use: /pack-back-{args.edition.lower()}.png")
        print(f"3. Deploy to Vercel: cd frontend && vercel --prod")
    else:
        print("\n💥 Generation failed. Check errors above.")
        sys.exit(1)


if __name__ == '__main__':
    main()
