#!/usr/bin/env python3
"""
Kroova Mystery Box Image Generator - Google Gemini Imagen 4
Gera imagens das 5 Mystery Boxes (Bronze, Silver, Gold, Platinum, Diamond)

Sistema de jackpot 100% AI-generated:
- Nenhuma imagem de banco/stock
- Estética cyberpunk consistente com KROUVA
- 5 tiers com cores únicas

Usage:
    python generate-mystery-box-images.py --all
    python generate-mystery-box-images.py --tier bronze
"""

import os
import sys
import argparse
from pathlib import Path
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

if not GOOGLE_API_KEY:
    print("❌ GOOGLE_API_KEY not found in environment")
    sys.exit(1)

try:
    from google import genai
    from google.genai import types
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    print("   Install with: pip install google-genai")
    sys.exit(1)

# Imagen 4 configuration
IMAGEN_CONFIG = {
    'model': 'imagen-4.0-generate-001',
    'number_of_images': 1,
    'aspect_ratio': '1:1',  # Square para melhor visualização no grid
    'person_generation': 'dont_allow',
}

# Mystery Box configurations
MYSTERY_BOXES = {
    'bronze': {
        'name': 'Bronze Mystery Box',
        'color_primary': '#cd7f32',  # Copper
        'color_glow': '#fdba74',     # Orange glow
        'color_particles': '#f97316', # Orange particles
        'material': 'aged bronze metal with copper patina',
        'effect': 'warm orange fire',
        'symbol': 'ancient bronze coin',
        'prize': 'R$ 15 (30x)',
        'atmosphere': 'ancient forge, molten bronze',
        'rarity': 'comum mas misterioso',
    },
    'silver': {
        'name': 'Silver Mystery Box',
        'color_primary': '#c0c0c0',  # Silver
        'color_glow': '#93c5fd',     # Blue glow
        'color_particles': '#60a5fa', # Blue particles
        'material': 'polished sterling silver with mirror finish',
        'effect': 'icy blue frost',
        'symbol': 'holographic silver moon',
        'prize': 'R$ 30 (30x)',
        'atmosphere': 'frozen crystalline palace',
        'rarity': 'raro e reluzente',
    },
    'gold': {
        'name': 'Gold Mystery Box',
        'color_primary': '#ffd700',  # Gold
        'color_glow': '#fde047',     # Yellow glow
        'color_particles': '#fbbf24', # Yellow particles
        'material': '24k pure gold with divine radiance',
        'effect': 'brilliant golden light',
        'symbol': 'sacred golden pyramid',
        'prize': 'R$ 60 (30x)',
        'atmosphere': 'temple treasure room, golden rays',
        'rarity': 'épico e cobiçado',
    },
    'platinum': {
        'name': 'Platinum Mystery Box',
        'color_primary': '#e5e4e2',  # Platinum
        'color_glow': '#c084fc',     # Purple glow
        'color_particles': '#a855f7', # Purple particles
        'material': 'rare platinum alloy with cosmic shimmer',
        'effect': 'royal purple energy',
        'symbol': 'platinum crown with amethyst gems',
        'prize': 'R$ 150 (30x)',
        'atmosphere': 'royal vault, purple nebula',
        'rarity': 'lendário e majestoso',
    },
    'diamond': {
        'name': 'Diamond Mystery Box',
        'color_primary': '#b9f2ff',  # Cyan diamond
        'color_glow': '#22d3ee',     # Cyan glow
        'color_particles': '#06b6d4', # Cyan particles
        'material': 'pure crystalline diamond with prismatic refractions',
        'effect': 'electric cyan lightning',
        'symbol': 'massive diamond with infinite facets',
        'prize': 'R$ 300 (30x)',
        'atmosphere': 'digital void, cyan energy matrix',
        'rarity': 'mítico e transcendental',
    },
}

def generate_mystery_box_prompt(tier: str) -> str:
    """
    Gera prompt para Mystery Box específica usando configuração do tier
    """
    
    config = MYSTERY_BOXES[tier]
    
    prompt = f"""
Ultra-realistic 3D render of a premium mystical treasure chest called "{config['name']}" for KROUVA gambling system. ISOLATED PRODUCT SHOT - NO BACKGROUND, NO GROUND, just the box floating in empty space with its own glow.

BOX DESIGN:
- Cubic mystery box (slightly wider than tall, treasure chest proportions)
- Material: {config['material']}
- Primary color: {config['color_primary']} with metallic sheen
- Surface engraved with glitching sacred geometry patterns (Flower of Life, Metatron's Cube)
- Digital circuit board traces mixed with mystical runes
- Front face features large glowing {config['symbol']} symbol
- KROUVA logo embossed on top lid (small, subtle)
- Keyhole on front glowing with {config['color_glow']} energy
- Lock clasp made of same metal as box
- Slightly damaged/aged texture showing history and mystery
- NO floating text or labels - pure box image only

GLITCH EFFECTS:
- Chromatic aberration on box edges (magenta/cyan split)
- Scanline artifacts crossing the box surface
- Small digital glitches/corruption in the patterns
- VHS tracking errors effect on one corner
- Holographic interference patterns

LIGHTING & ATMOSPHERE:
- Dramatic rim lighting creating {config['color_glow']} glow around edges
- {config['effect']} emanating from keyhole and cracks
- Volumetric god rays in {config['color_particles']} color
- {config['atmosphere']} aesthetic in the glow only
- NO background - all atmosphere comes from the box's own glow
- Floating {config['color_particles']} colored particles/sparkles around box (20-30 particles max)
- Subtle energy wisps connecting particles
- Lens flares on brightest points

MYSTICAL ELEMENTS:
- Ancient runes pulsing with light
- Sacred geometry symbols glowing
- Keyhole leaking magical energy
- Faint aura suggesting contents within
- Mysterious and valuable appearance
- Mix of ancient artifact + futuristic tech

COMPOSITION:
- Box centered, slight 3/4 angle showing front and top
- Floating in void with own illumination
- Dramatic perspective with slight fish-eye distortion
- Sharp focus on entire box
- Cinematic depth of field (box sharp, particle glow soft)

TECHNICAL QUALITY:
- 8K photorealistic render
- Octane Render / Unreal Engine 5 quality
- PBR materials (Physically Based Rendering)
- Ray-traced reflections and refractions
- HDR lighting with bloom
- Professional 3D product visualization

BRANDING:
- Small "KROUVA MYSTERY BOX" text engraved on bottom edge
- Tier indicator: "{tier.upper()}" on small metal plate
- Prize amount "{config['prize']}" in small holographic text near lock
- QR code texture on bottom (barely visible)

MOOD:
- {config['rarity']}
- Impossível resistir abrir
- Promessa de fortuna
- Luxo + mistério + tecnologia
- Vício visual

STYLE REFERENCES:
- Hearthstone card pack opening
- Overwatch loot box aesthetic  
- Destiny 2 exotic engrams
- Borderlands legendary chest glow
- Diablo immortal gem quality

AVOID:
- Any background or environment
- Ground, floor, or surface
- Hands or people
- Multiple boxes
- Overly dark or muddy colors
- Excessive fog that hides details

CRITICAL: The mystery box should be the SOLE object in frame, floating in empty space. All atmosphere and drama comes from its own glow and particle effects. White/transparent background for easy compositing.
"""
    
    return prompt.strip()


def generate_box_image(tier: str, output_dir: str = "output/mystery-boxes"):
    """Generate mystery box image using Gemini Imagen 4"""
    
    config = MYSTERY_BOXES[tier]
    output_path = f"{output_dir}/mystery-box-{tier}.png"
    
    print(f"\n{'='*70}")
    print(f"🎁 Generating {config['name']}...")
    print(f"   Tier: {tier.upper()}")
    print(f"   Color: {config['color_primary']}")
    print(f"   Prize: {config['prize']}")
    print(f"   Output: {output_path}")
    print(f"{'='*70}")
    
    # Initialize Gemini client
    client = genai.Client(api_key=GOOGLE_API_KEY)
    
    # Generate prompt
    prompt = generate_mystery_box_prompt(tier)
    
    print("\n📝 Prompt preview:")
    print("-" * 70)
    print(prompt[:500] + "...\n[TRUNCATED]")
    print("-" * 70)
    
    try:
        # Generate image
        print("\n⏳ Generating image (30-60 seconds)...")
        
        response = client.models.generate_images(
            model=IMAGEN_CONFIG['model'],
            prompt=prompt,
            config={
                'number_of_images': IMAGEN_CONFIG['number_of_images'],
                'aspect_ratio': IMAGEN_CONFIG['aspect_ratio'],
                'safety_filter_level': 'block_low_and_above',
                'person_generation': IMAGEN_CONFIG['person_generation'],
            }
        )
        
        # Save image
        if response.generated_images:
            image_data = response.generated_images[0].image.image_bytes
            
            # Ensure output directory exists
            Path(output_dir).mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'wb') as f:
                f.write(image_data)
            
            file_size_mb = len(image_data) / (1024 * 1024)
            print(f"\n✅ SUCCESS! {config['name']} generated!")
            print(f"   📁 Saved: {output_path}")
            print(f"   📊 Size: {file_size_mb:.2f} MB")
            
            return True
        else:
            print(f"❌ No images generated for {tier}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error generating {tier} box: {e}")
        if "quota" in str(e).lower():
            print("   💡 Quota exceeded. Wait or check Google Cloud billing.")
        elif "safety" in str(e).lower():
            print("   💡 Safety filter triggered. Prompt may need adjustment.")
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Generate Mystery Box images with Vertex AI Imagen 4',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Generate all 5 boxes:
    python generate-mystery-box-images.py --all
    
  Generate specific tier:
    python generate-mystery-box-images.py --tier bronze
    python generate-mystery-box-images.py --tier diamond
    
  Custom output directory:
    python generate-mystery-box-images.py --all -o custom/path
        """
    )
    
    parser.add_argument(
        '--all',
        action='store_true',
        help='Generate all 5 mystery box tiers'
    )
    
    parser.add_argument(
        '--tier',
        choices=['bronze', 'silver', 'gold', 'platinum', 'diamond'],
        help='Generate specific tier only'
    )
    
    parser.add_argument(
        '-o', '--output',
        default='output/mystery-boxes',
        help='Output directory (default: output/mystery-boxes)'
    )
    
    parser.add_argument(
        '--delay',
        type=int,
        default=5,
        help='Delay in seconds between generation (default: 5)'
    )
    
    args = parser.parse_args()
    
    if not args.all and not args.tier:
        parser.error("Must specify --all or --tier")
    
    print("🎰 KROUVA MYSTERY BOX IMAGE GENERATOR")
    print("="*70)
    print(f"Model: {IMAGEN_CONFIG['model']}")
    print(f"Output: {args.output}/")
    print(f"API Key: {'✓ Found' if GOOGLE_API_KEY else '✗ Missing'}")
    print("="*70)
    
    # Determine which tiers to generate
    if args.all:
        tiers = list(MYSTERY_BOXES.keys())
        print(f"\n🔄 Generating ALL {len(tiers)} mystery boxes...")
    else:
        tiers = [args.tier]
        print(f"\n🎯 Generating single tier: {args.tier.upper()}")
    
    # Generate images
    results = {}
    for i, tier in enumerate(tiers):
        results[tier] = generate_box_image(tier, args.output)
        
        # Delay between requests (except last one)
        if i < len(tiers) - 1:
            print(f"\n⏸️  Waiting {args.delay}s before next generation...")
            time.sleep(args.delay)
    
    # Summary
    print("\n" + "="*70)
    print("📊 GENERATION SUMMARY")
    print("="*70)
    
    successful = [tier for tier, success in results.items() if success]
    failed = [tier for tier, success in results.items() if not success]
    
    print(f"✅ Successful: {len(successful)}/{len(tiers)}")
    for tier in successful:
        print(f"   - {MYSTERY_BOXES[tier]['name']}")
    
    if failed:
        print(f"\n❌ Failed: {len(failed)}/{len(tiers)}")
        for tier in failed:
            print(f"   - {MYSTERY_BOXES[tier]['name']}")
    
    print("\n💡 NEXT STEPS:")
    print("   1. Review generated images in output/mystery-boxes/")
    print("   2. Copy approved images to frontend/public/mystery-boxes/")
    print("   3. Update Mystery Box UI to use new images")
    print("   4. Test on staging before production deploy")
    
    if len(successful) == 5:
        print("\n🎉 ALL 5 MYSTERY BOXES GENERATED SUCCESSFULLY!")
        print("   Ready for production! 🚀")


if __name__ == "__main__":
    main()
