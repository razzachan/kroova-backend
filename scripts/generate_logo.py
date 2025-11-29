#!/usr/bin/env python3
"""
KROUVA Logo & Favicon Generator
Generates high-quality brand assets using Google Imagen 4
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
    import io
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    sys.exit(1)

client = genai.Client(api_key=GOOGLE_API_KEY)

# Logo variations
LOGO_CONFIGS = {
    'logo_full': {
        'prompt': """
3D embossed logo design, the word "KROUVA" in futuristic cyberpunk font,
metallic chrome texture with magenta and cyan neon light reflections, 
high relief emboss effect, depth and shadow, glossy metallic surface,
holographic accents, circuit pattern details in the letters, dramatic lighting,
photorealistic 3D render, black background, ultra detailed 8k, modern gaming aesthetic
        """.strip(),
        'size': 1024,
        'output': 'logo_full.png'
    },
    'logo_icon': {
        'prompt': """
3D embossed letter "K" logo icon, futuristic cyberpunk style, metallic chrome texture
with magenta and cyan neon glow, high relief emboss effect with deep shadows,
glossy reflective surface, holographic accents, circuit pattern integrated into letter,
geometric angular design, dramatic lighting from top, photorealistic 3D render,
black background, ultra detailed 8k, perfect for app icon
        """.strip(),
        'size': 512,
        'output': 'logo_icon.png'
    },
    'favicon': {
        'prompt': """
Minimalist letter "K" icon, futuristic cyberpunk style, magenta and cyan neon glow,
simple geometric design, metallic texture, black background, clean and recognizable
at small sizes, bold and modern, perfect for favicon, ultra sharp, 8k quality
        """.strip(),
        'size': 256,
        'output': 'favicon_large.png'
    }
}

def generate_asset(key: str, config: dict):
    output_path = Path('frontend/public') / config['output']
    
    print(f"\n{'='*70}")
    print(f"🎨 Generating: {key}")
    print(f"   Size: {config['size']}x{config['size']}")
    print(f"   Output: {output_path}")
    print(f"{'='*70}\n")
    
    try:
        print("⏳ Generating with Imagen 4 Ultra...")
        
        response = client.models.generate_images(
            model='imagen-4.0-ultra-generate-001',
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
        
        # Create additional favicon sizes
        if key == 'favicon':
            pil_img = Image.open(output_path)
            
            # 32x32 favicon
            favicon_32 = pil_img.resize((32, 32), Image.Resampling.LANCZOS)
            favicon_32.save('frontend/public/favicon.ico', format='ICO', sizes=[(32, 32)])
            print(f"   ✅ favicon.ico (32x32)")
            
            # 16x16 favicon
            favicon_16 = pil_img.resize((16, 16), Image.Resampling.LANCZOS)
            favicon_16_path = Path('frontend/public/favicon-16x16.png')
            favicon_16.save(favicon_16_path)
            print(f"   ✅ favicon-16x16.png")
            
            # 32x32 PNG
            favicon_32_png = pil_img.resize((32, 32), Image.Resampling.LANCZOS)
            favicon_32_path = Path('frontend/public/favicon-32x32.png')
            favicon_32_png.save(favicon_32_path)
            print(f"   ✅ favicon-32x32.png")
            
            # 180x180 Apple touch icon
            apple_icon = pil_img.resize((180, 180), Image.Resampling.LANCZOS)
            apple_icon_path = Path('frontend/public/apple-touch-icon.png')
            apple_icon.save(apple_icon_path)
            print(f"   ✅ apple-touch-icon.png (180x180)")
        
        print(f"\n✅ SUCCESS: {key} generated!")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 KROUVA Brand Assets Generator")
    print("="*70)
    
    for key, config in LOGO_CONFIGS.items():
        result = generate_asset(key, config)
        if not result:
            print(f"⚠️  Failed to generate {key}, continuing...")
    
    print("\n" + "="*70)
    print("✅ Brand assets generation complete!")
    print("="*70)
