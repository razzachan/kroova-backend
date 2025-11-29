#!/usr/bin/env python3
"""
Kroova Booster Pack Image Generator - Google Gemini Imagen 4
Gera imagens de BOOSTER PACK FECHADO para qualquer edição

Sistema modular:
- Usa configs de booster-pack-configs/*.py
- Mantém estética consistente da marca
- Personaliza elementos por edição

Usage:
    python generate-booster-pack-image.py --edition ed01 -o pack-front-ed01.png
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
    'aspect_ratio': '3:4',  # Portrait, mesma proporção das cartas (1792x2560)
    'person_generation': 'dont_allow',  # Não precisa pessoas no pack
}

def generate_booster_pack_prompt(edition_config: dict) -> str:
    """
    Gera prompt modular para booster pack baseado em config da edição
    """
    
    prompt = f"""
Ultra-realistic product photography of a sealed trading card booster pack for "KROUVA: {edition_config['edition_name']}" edition. ISOLATED PRODUCT SHOT with NO BACKGROUND - the booster pack should be the ONLY element in the frame, floating in empty white/transparent space.

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

CRITICAL: The booster pack should be the ONLY element in the image. No dark backgrounds, no surfaces, no context - just the pack floating in space with its own lighting and glow effects creating the atmosphere.

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
"""
    
    return prompt.strip()

PRODUCT DESIGN:
- Holographic foil packaging with iridescent rainbow shimmer
- Front features glitching digital entity face emerging from code matrix
- Geometric sacred patterns mixed with circuit board traces
- Neon magenta (#FF006D) and cyber cyan (#00F0FF) accent lines creating frame
- Royal amber (#FFC700) "KROUVA" logo at top with glitch effect (NOTE: KROUVA with U, not KROOVA)
- Edition name "COLAPSO DA INTERFACE" in futuristic bold font
- Subtitle in small text: "Se você olhar fixamente para o algoritmo, ele começa a te ver também"
- Holographic seal/badge showing "ED01" and "5 CARTAS" (5 cards inside)
- Barcode and QR code elements integrated as design details
- Warning text: "CONTÉM ENTIDADES DIGITAIS VIVAS"

VISUAL STYLE:
- Professional product shot with dramatic lighting
- Volumetric neon fog ONLY around the edges of the pack
- Rim lighting creating cyan and magenta glow on edges
- Straight-on view, slightly tilted (10 degrees) for dynamic look
- Sharp focus on entire pack
- Floating digital glitch particles ONLY near the pack edges
- Premium luxury collectible feel
- Mix of sacred geometry (triangles, hexagons) with tech patterns
- Chromatic aberration effect on edges for cyberpunk aesthetic

BRANDING ELEMENTS:
- "ALGORITMO VIVO" symbol/icon incorporated into design
- Small "influência • consumo • ganância" icons near bottom
- Metallic foil texture visible with light reflections
- Damaged/glitched areas showing "corrupted data" aesthetics
- Premium packaging feel: thick cardstock, embossed details

ATMOSPHERE:
- Mysterious and addictive visual appeal
- Like opening gateway to digital realm
- Sacred relic meets high-tech product
- Dystopian luxury collectible

CRITICAL: The booster pack should be the ONLY element in the image. NO background, NO surface below, NO environment. Just the pack itself with some neon glow/particles around its edges. White or transparent background preferred for easy compositing.

Technical: Photorealistic 8K render, cinematic color grading, sharp details, professional studio photography lighting setup, isolated product shot.
"""
    
    return prompt.strip()


def generate_pack_image(output_path: str = "pack-front-ed01.png"):
    """Generate booster pack image using Gemini Imagen 4"""
    
    print("🎨 Generating KROOVA ED01 Booster Pack image...")
    print(f"   Model: {IMAGEN_CONFIG['model']}")
    print(f"   Output: {output_path}")
    
    # Initialize Gemini client
    client = genai.Client(api_key=GOOGLE_API_KEY)
    
    # Generate prompt
    prompt = generate_booster_pack_prompt()
    
    print("\n📝 Prompt:")
    print("-" * 60)
    print(prompt)
    print("-" * 60)
    
    try:
        # Generate image
        print("\n⏳ Generating image (this may take 30-60 seconds)...")
        
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
            print(f"   3. Update booster pack UI to use new image")
            
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
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate Kroova ED01 Booster Pack image')
    parser.add_argument(
        '-o', '--output',
        default='pack-front-ed01.png',
        help='Output filename (default: pack-front-ed01.png)'
    )
    
    args = parser.parse_args()
    
    success = generate_pack_image(args.output)
    sys.exit(0 if success else 1)
