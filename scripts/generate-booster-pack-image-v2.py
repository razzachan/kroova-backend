#!/usr/bin/env python3
"""
Kroova Booster Pack Image Generator - Modular Edition System
Gera imagens de BOOSTER PACK FECHADO para qualquer edição

Sistema modular que mantém estética consistente da marca
enquanto personaliza elementos por edição.

Usage:
    python generate-booster-pack-image.py --edition ed01 -o pack-front-ed01.png
    python generate-booster-pack-image.py --edition ed02 -o pack-front-ed02.png
"""

import os
import sys
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    print("❌ GOOGLE_API_KEY not found in environment")
    sys.exit(1)

# Add booster-pack-configs to path
configs_dir = Path(__file__).parent / 'booster-pack-configs'
sys.path.insert(0, str(configs_dir))

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
    'aspect_ratio': '3:4',
    'person_generation': 'dont_allow',
}

def load_edition_config(edition_id: str) -> dict:
    """Carrega config da edição especificada"""
    try:
        module_name = f'{edition_id}_config'
        config_module = __import__(module_name)
        config_key = f'{edition_id.upper()}_CONFIG'
        
        if not hasattr(config_module, config_key):
            print(f"❌ Config key '{config_key}' not found in {module_name}.py")
            sys.exit(1)
            
        return getattr(config_module, config_key)
    except ImportError:
        print(f"❌ Config file not found: booster-pack-configs/{edition_id}_config.py")
        print(f"   Create it using ed_template.py as reference")
        sys.exit(1)

def generate_booster_pack_prompt(edition_config: dict) -> str:
    """Gera prompt modular baseado em config da edição"""
    
    return f"""
Ultra-realistic product photography of a sealed trading card booster pack for "KROUVA: {edition_config['edition_name']}" edition. 
ISOLATED PRODUCT SHOT with NO BACKGROUND - the booster pack should be the ONLY element in the frame, floating in empty white/transparent space.

PRODUCT DESIGN:
- Premium holographic foil packaging with intense iridescent rainbow shimmer
- The metallic foil reflects light in multiple colors (pink, cyan, gold, purple)
- Front features: {edition_config['central_art']}
- Geometric sacred patterns (Metatron's cube, platonic solids) mixed with circuit board traces
- Neon magenta (#FF006D) and cyber cyan (#00F0FF) glowing accent lines
- {edition_config['color_accent']} as complementary gradient
- Royal amber (#FFC700) "KROUVA" logo at top with subtle glitch/chromatic aberration (NOTE: KROUVA with U, not KROOVA)
- Edition name "{edition_config['edition_name']}" in futuristic bold font (cyberpunk style)
- Subtitle in smaller text: "{edition_config['tagline']}"
- Holographic circular seal showing "{edition_config['edition_id']}" and "{edition_config['cards_per_pack']} CARTAS"
- Small warning text near bottom: "{edition_config['warning']}"

LIGHTING & EFFECTS:
- Dramatic rim lighting from behind (magenta on one side, cyan on the other)
- Soft key light from front to show holographic details
- Light caustics and rainbow refractions across the surface
- Subtle digital particles/glitches floating around edges
- Chromatic aberration on the extreme edges of the pack
- Glow effect around the brightest elements

COMPOSITION:
- Pack centered, slight 3/4 angle showing depth
- Visible thickness of the sealed pack
- Sharp focus on center, slight depth of field on edges
- Professional product photography aesthetic
- Cinematic color grading with high contrast

MATERIALS & TEXTURE:
- Metallic holographic foil (primary surface)
- Glossy laminated overlay
- Embossed/debossed details on logo
- Visible foil texture with microscopic prisms

BRANDING ELEMENTS:
- Small icons near bottom: {edition_config['icon_bottom']}
- QR code or serial number (subtle, bottom corner)
- "OFFICIAL TRADING CARDS" micro-text
- Krouva logo watermark (very subtle)

STYLE REFERENCES:
- High-end trading card pack (Pokémon, Magic premium products)
- Cyberpunk 2077 UI aesthetic
- Holographic concert tickets/festival wristbands
- Premium tech product packaging (Apple, Sony)

TECHNICAL REQUIREMENTS:
- 8K quality, ultra-sharp details
- HDR lighting
- Photorealistic materials
- No background, no shadows on ground
- Suitable for e-commerce/digital storefront display

CRITICAL: The booster pack should be the ONLY element in the image. 
No dark backgrounds, no surfaces, no context - just the pack floating in space 
with its own lighting and glow effects creating the atmosphere.

CYBERPUNK ATMOSPHERE:
- Theme: {edition_config['theme']}
- Neon glow emanating from the pack edges
- Subtle digital artifacts/glitches in the air around pack
- Color palette leans heavily toward magenta/cyan/amber neon

AVOID:
- People, hands, or body parts
- Tables, surfaces, or ground
- Dark backgrounds or environments
- Any objects other than the pack itself
- Excessive fog that obscures details
""".strip()

def generate_pack_image(edition_id: str, output_path: str = None) -> bool:
    """Gera imagem do booster pack para a edição especificada"""
    
    print(f"\n🎨 Generating Booster Pack Image")
    print(f"   Edition: {edition_id.upper()}")
    
    # Load edition config
    config = load_edition_config(edition_id)
    print(f"   Name: {config['edition_name']}")
    
    # Set default output path if not provided
    if not output_path:
        output_path = f"pack-front-{edition_id}.png"
    
    # Generate prompt
    prompt = generate_booster_pack_prompt(config)
    
    print(f"\n📝 Prompt generated ({len(prompt)} chars)")
    print(f"   Central Art: {config['central_art'][:60]}...")
    print(f"   Color Accent: {config['color_accent'][:50]}...")
    
    try:
        # Create client
        client = genai.Client(api_key=GOOGLE_API_KEY)
        
        print("\n🤖 Calling Imagen 4...")
        
        # Generate image
        response = client.models.generate_images(
            model=IMAGEN_CONFIG['model'],
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=IMAGEN_CONFIG['number_of_images'],
                aspect_ratio=IMAGEN_CONFIG['aspect_ratio'],
                person_generation=IMAGEN_CONFIG['person_generation'],
                safety_filter_level='block_low_and_above',
            )
        )
        
        if response.generated_images:
            image = response.generated_images[0]
            image_data = image.image.image_bytes
            
            # Ensure output directory exists
            output_dir = Path(output_path).parent
            if output_dir and not output_dir.exists():
                output_dir.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'wb') as f:
                f.write(image_data)
            
            file_size_mb = len(image_data) / (1024 * 1024)
            print(f"\n✅ Image generated successfully!")
            print(f"   📁 Saved to: {output_path}")
            print(f"   📊 Size: {file_size_mb:.2f} MB")
            print(f"\n💡 Next steps:")
            print(f"   1. Review the image")
            print(f"   2. Copy to frontend/public/ if approved")
            print(f"   3. Update booster pack UI to use: /{Path(output_path).name}")
            
            return True
        else:
            print("❌ No images generated in response")
            return False
            
    except Exception as e:
        print(f"\n❌ Error generating image: {e}")
        if "quota" in str(e).lower():
            print("   💡 Quota exceeded. Wait a bit or check your Google Cloud billing.")
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='Generate Kroova Booster Pack image for any edition',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate-booster-pack-image.py --edition ed01
  python generate-booster-pack-image.py --edition ed02 -o frontend/public/pack-front-ed02.png
  python generate-booster-pack-image.py --edition ed03 -o custom-output.png
        """
    )
    parser.add_argument(
        '--edition',
        default='ed01',
        help='Edition ID (ed01, ed02, etc). Must have corresponding config file.'
    )
    parser.add_argument(
        '-o', '--output',
        default=None,
        help='Output path (default: pack-front-{edition}.png in current directory)'
    )
    
    args = parser.parse_args()
    
    success = generate_pack_image(args.edition.lower(), args.output)
    sys.exit(0 if success else 1)
