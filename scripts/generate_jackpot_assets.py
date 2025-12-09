#!/usr/bin/env python3
"""
KROOVA Jackpot Assets Generator
Generates high-quality images for jackpot animation using Imagen 4

Creates:
- Falling gold coins (transparent PNG)
- Crown/trophy icon (transparent PNG)
- Glow effects overlays
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    print("❌ GOOGLE_API_KEY not found in .env")
    sys.exit(1)

try:
    from google import genai
except ImportError:
    print("❌ Missing google-genai package")
    print("   Install with: pip install google-genai")
    sys.exit(1)

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "public" / "animations"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Asset configurations
ASSETS = {
    'coins': {
        'prompt': """
A collection of realistic golden coins falling and spinning in mid-air against transparent background.
Photorealistic 3D render of 15-20 gold coins at various angles and depths.
Each coin shows detailed engravings, metallic reflections, and rim details.
Coins have deep gold color (#FFD700) with darker bronze shadows (#B8860B).
Strong rim lighting creating bright highlights on edges.
Coins are at different rotation angles showing both faces and edges.
Some coins sharp in focus, others motion-blurred for depth.
Professional CGI quality like AAA game assets or casino graphics.
Transparent background (no background, alpha channel).
Studio lighting with god rays between coins.
Volumetric light scattering effect.
""",
        'filename': 'jackpot-coins.png',
        'negative_prompt': 'flat, cartoon, simple, low quality, blurry background, solid background, white background'
    },
    
    'crown': {
        'prompt': """
A majestic golden crown icon, photorealistic 3D render on transparent background.
Royal crown with ornate details, gemstones (ruby red, sapphire blue, emerald green).
Polished gold material (#FFD700) with chrome-like reflections.
Crown has 5 points with decorative crosses on tips.
Embedded jewels catching light with prismatic refractions.
Soft glow emanating from crown center.
Luxury product photography style lighting.
Sharp details on filigree patterns and engravings.
Transparent background (alpha channel, no background).
Dramatic rim lighting creating bright outline.
Perfect for game UI / casino jackpot graphics.
""",
        'filename': 'jackpot-crown.png',
        'negative_prompt': 'flat, cartoon, simple, low quality, background, people, text'
    },
    
    'mega_text': {
        'prompt': """
Glossy 3D text saying "MEGA WIN" in bold letters, photorealistic render.
Letters have chrome gold gradient material (#FFD700 to #FFA500).
Strong beveled edges with bright highlights.
Inner glow effect in warm yellow (#FFEB3B).
Outer glow creating halo around each letter.
Letters slightly tilted for dynamic energy.
Reflections on letter surfaces showing environment.
Transparent background (alpha channel).
Vegas-style casino typography.
Premium slot machine aesthetic.
Studio lighting with rim light on letter edges.
""",
        'filename': 'jackpot-mega-text.png',
        'negative_prompt': 'flat text, simple, low quality, background, cartoonish'
    }
}


class JackpotAssetGenerator:
    """Generates jackpot animation assets using Imagen 4"""
    
    def __init__(self):
        print("🔧 Initializing Imagen 4")
        self.client = genai.Client(api_key=GOOGLE_API_KEY)
        self.model = 'imagen-4.0-ultra-generate-001'
        print(f"✅ Using model: {self.model}")
    
    def generate_asset(self, name: str, config: dict) -> bytes:
        """Generate a single asset image"""
        print(f"\n🎨 Generating {name}...")
        print(f"📝 Prompt: {config['prompt'][:100]}...")
        
        try:
            response = self.client.models.generate_images(
                model=self.model,
                prompt=config['prompt'],
                config={
                    'number_of_images': 1,
                    'aspect_ratio': '1:1',
                    'safety_filter_level': 'block_low_and_above',
                    'person_generation': 'dont_allow',
                }
            )
            
            if not response.generated_images:
                raise ValueError("No images generated")
            
            image_bytes = response.generated_images[0].image.image_bytes
            print(f"✅ Generated {len(image_bytes) / 1024:.1f} KB")
            
            return image_bytes
            
        except Exception as e:
            print(f"❌ Failed to generate {name}: {e}")
            raise
    
    def save_asset(self, name: str, image_bytes: bytes, filename: str):
        """Save asset to file"""
        output_path = OUTPUT_DIR / filename
        output_path.write_bytes(image_bytes)
        print(f"💾 Saved: {output_path}")


def main():
    print("=" * 60)
    print("KROOVA JACKPOT ASSETS GENERATOR")
    print("=" * 60)
    
    generator = JackpotAssetGenerator()
    
    for name, config in ASSETS.items():
        try:
            image_bytes = generator.generate_asset(name, config)
            generator.save_asset(name, image_bytes, config['filename'])
        except Exception as e:
            print(f"⚠️  Skipping {name} due to error")
            continue
    
    print("\n" + "=" * 60)
    print("✅ ASSETS GENERATED!")
    print("=" * 60)
    print(f"\n📁 Location: {OUTPUT_DIR}")
    print("\n📋 Generated files:")
    for config in ASSETS.values():
        print(f"   - {config['filename']}")
    print("\n🚀 Ready to integrate into frontend!")


if __name__ == "__main__":
    main()
