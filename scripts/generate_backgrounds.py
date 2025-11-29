#!/usr/bin/env python3
"""
KROOVA Living Interface - Background Generator
Generates cinematic parallax backgrounds for each route using Google Imagen 4

Usage:
    python generate_backgrounds.py --all
    python generate_backgrounds.py --route home
    python generate_backgrounds.py --route boosters marketplace

Features:
- Route-specific atmospheric prompts
- Ultra-wide 16:9 cinematic format
- 4K resolution (3840x2160) for parallax layers
- WebP optimization for web delivery
- Consistent KROOVA cyberpunk aesthetic
- 5-layer parallax depth support
"""

import os
import sys
import argparse
import time
from pathlib import Path
from typing import List, Dict
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
    from PIL import Image
    import io
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    print("   Install with: pip install google-genai python-dotenv pillow")
    sys.exit(1)

# ====== ROUTE BACKGROUND CONFIGURATIONS ======
BACKGROUNDS = {
    'home': {
        'name': 'Interface Awakening',
        'feeling': 'First moment entering the Interface',
        'prompt': """
Cyberpunk city street at night, ultra-wide cinematic angle, towering skyscrapers
on both sides creating depth, neon signs in magenta and cyan colors, volumetric
fog with light beams, wet reflective streets, geometric patterns in dark sky,
atmospheric moody lighting, photorealistic architecture, bokeh lights in distance,
8k ultra detailed, cinematic composition, futuristic urban landscape, no people
        """.strip(),
        'negative_prompt': 'people, characters, text, UI elements, logos, watermarks, cars, vehicles, daytime, bright, oversaturated, cartoon, anime',
        'colors': ['#FF006D', '#00F0FF', '#1a1a2e']
    },
    
    'boosters': {
        'name': 'Digital Bazaar Street',
        'feeling': 'Street market where entities are sold',
        'prompt': """
Cyberpunk night market street, neon storefronts with holographic displays, towering
buildings made of stacked geometric shapes, magenta and cyan neon signs, atmospheric
volumetric fog, wet reflective pavement, multiple depth layers, ultra-wide cinematic
angle, moody lighting, futuristic architecture, photorealistic, 8k detailed, no people
        """.strip(),
        'negative_prompt': 'daytime, bright, clean, corporate, modern, people faces, text, UI, logos, cars, vehicles',
        'colors': ['#FF006D', '#00F0FF', '#FFC700']
    },
    
    'marketplace': {
        'name': 'Entity Trading Floor',
        'feeling': 'Underground where entities are traded',
        'prompt': """
Underground cyber trading floor, holographic displays floating in space, neon data
streams flowing through air, cyan and magenta ambient lighting, industrial tech
architecture, circuit pattern floor with reflections, volumetric fog layers,
cinematic wide angle from elevated view, moody atmospheric lighting, futuristic
trading environment, photorealistic, 8k detailed, gold accent lights, no people
        """.strip(),
        'negative_prompt': 'daylight, windows, outside, people faces, text, UI, logos, bright, clean, modern office',
        'colors': ['#00F0FF', '#FF006D', '#FFC700']
    },
    
    'inventory': {
        'name': 'Personal Vault Dimension',
        'feeling': 'Your personal space in the Interface',
        'prompt': """
Digital vault in dark cyberspace, holographic cards floating in organized grid,
subtle neon glow in magenta and cyan, dark void background with minimal geometric
grid pattern, clean minimalist design, multiple depth layers with selective focus,
atmospheric subtle fog, cinematic lighting from card glows, photorealistic,
8k detailed, ultra-wide composition, futuristic vault aesthetic, no people
        """.strip(),
        'negative_prompt': 'cluttered, messy, people, text, UI buttons, logos, bright, daytime, outdoor',
        'colors': ['#1a1a2e', '#FF006D', '#00F0FF']
    },
    
    'wallet': {
        'name': 'Financial Stream',
        'feeling': 'Abstract representation of money flow',
        'prompt': """
Abstract financial cyberspace, neon data streams flowing through space, holographic
blockchain visualization with geometric nodes, circuit pattern floor with reflections,
cyan magenta and gold neon colors, floating currency symbols, layered translucent
data planes creating depth, volumetric fog, ultra-wide cinematic angle, dramatic
atmospheric lighting, futuristic digital vault aesthetic, photorealistic, 8k detailed,
minimal geometric patterns, no people
        """.strip(),
        'negative_prompt': 'people, characters, faces, text, UI, logos, daytime, outdoor, bright, coins, bills, physical money',
        'colors': ['#00F0FF', '#FFC700', '#1a1a2e']
    }
}

# ====== GENERATOR CLASS ======
class BackgroundGenerator:
    def __init__(self, output_dir: str = 'frontend/public/backgrounds'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize Gemini client
        self.client = genai.Client(api_key=GOOGLE_API_KEY)
        
        print(f"✅ Initialized BackgroundGenerator")
        print(f"   Output directory: {self.output_dir}")
    
    def generate(self, route_key: str, model: str = 'imagen-4.0-ultra-generate-001') -> bool:
        """
        Generate background for a specific route
        
        Args:
            route_key: Route identifier (home, boosters, marketplace, etc)
            model: Imagen model to use
            
        Returns:
            bool: True if successful, False otherwise
        """
        if route_key not in BACKGROUNDS:
            print(f"❌ Unknown route: {route_key}")
            print(f"   Available routes: {', '.join(BACKGROUNDS.keys())}")
            return False
        
        config = BACKGROUNDS[route_key]
        output_path = self.output_dir / f"{route_key}.png"
        webp_path = self.output_dir / f"{route_key}.webp"
        
        print(f"\n{'='*70}")
        print(f"🎨 Generating: {config['name']}")
        print(f"   Route: /{route_key}")
        print(f"   Feeling: {config['feeling']}")
        print(f"   Output: {output_path}")
        print(f"{'='*70}\n")
        
        try:
            # Show prompt
            print("📝 Prompt:")
            print(config['prompt'][:200] + "..." if len(config['prompt']) > 200 else config['prompt'])
            print()
            
            # Generate image
            print("⏳ Generating 4K image with Imagen 4 Ultra (15-45 seconds)...")
            start_time = time.time()
            
            response = self.client.models.generate_images(
                model=model,
                prompt=config['prompt'],
                config={
                    'number_of_images': 1,
                    'aspect_ratio': '16:9',
                    'person_generation': 'dont_allow',
                }
            )
            
            generation_time = time.time() - start_time
            print(f"✅ Generated in {generation_time:.1f}s")
            
            # Debug response
            print(f"🔍 Response type: {type(response)}")
            if hasattr(response, 'sdk_http_response'):
                http_resp = response.sdk_http_response
                print(f"🔍 HTTP Status: {http_resp.status_code if hasattr(http_resp, 'status_code') else 'N/A'}")
                if hasattr(http_resp, 'json_data'):
                    print(f"🔍 Response data: {http_resp.json_data}")
            
            # Check if images were generated
            if not response.generated_images:
                print("❌ No images generated - likely blocked by safety filters")
                print(f"   Try simplifying the prompt or removing certain keywords")
                print(f"   Full response: {response}")
                return False
            
            # Get image from response (it's already a PIL-like image)
            generated_image = response.generated_images[0].image
            
            # Save PNG (high quality source)
            print(f"💾 Saving PNG: {output_path}")
            generated_image.save(output_path)
            
            png_size = output_path.stat().st_size / (1024 * 1024)
            print(f"   PNG size: {png_size:.2f} MB")
            
            # Convert to WebP (need to reload as PIL Image for format conversion)
            print(f"🔄 Converting to WebP: {webp_path}")
            pil_img = Image.open(output_path)
            pil_img.save(webp_path, 'WEBP', quality=95, method=6)  # Increased quality to 95
            
            webp_size = webp_path.stat().st_size / (1024 * 1024)
            compression_ratio = (1 - webp_size / png_size) * 100
            print(f"   WebP size: {webp_size:.2f} MB ({compression_ratio:.1f}% smaller)")
            
            # Show color palette
            print(f"🎨 Color palette: {', '.join(config['colors'])}")
            
            print(f"\n✅ SUCCESS: {config['name']} generated!")
            print(f"   PNG:  {output_path}")
            print(f"   WebP: {webp_path}")
            
            return True
            
        except Exception as e:
            print(f"\n❌ ERROR generating {route_key}: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    def generate_all(self, model: str = 'imagen-4.0-ultra-generate-001', delay: int = 3) -> Dict[str, bool]:
        """
        Generate all backgrounds with rate limiting
        
        Args:
            model: Imagen model to use
            delay: Seconds to wait between generations
            
        Returns:
            Dict mapping route keys to success status
        """
        results = {}
        total = len(BACKGROUNDS)
        
        print(f"\n{'='*70}")
        print(f"🚀 BATCH GENERATION: {total} backgrounds")
        print(f"   Model: {model}")
        print(f"   Delay: {delay}s between generations")
        print(f"{'='*70}")
        
        for i, route_key in enumerate(BACKGROUNDS.keys(), 1):
            print(f"\n[{i}/{total}] Processing {route_key}...")
            
            success = self.generate(route_key, model)
            results[route_key] = success
            
            if i < total and success:
                print(f"\n⏸️  Waiting {delay}s before next generation...")
                time.sleep(delay)
        
        # Summary
        print(f"\n{'='*70}")
        print(f"📊 GENERATION SUMMARY")
        print(f"{'='*70}")
        
        successful = sum(1 for v in results.values() if v)
        failed = total - successful
        
        print(f"✅ Successful: {successful}/{total}")
        if failed > 0:
            print(f"❌ Failed: {failed}/{total}")
            failed_routes = [k for k, v in results.items() if not v]
            print(f"   Routes: {', '.join(failed_routes)}")
        
        print(f"\n📁 Output directory: {self.output_dir}")
        print(f"   PNG files: {successful} x ~8-12 MB = ~{successful * 10} MB")
        print(f"   WebP files: {successful} x ~2-4 MB = ~{successful * 3} MB")
        
        return results

# ====== CLI ======
def main():
    parser = argparse.ArgumentParser(
        description='Generate cinematic backgrounds for KROOVA Living Interface',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate_backgrounds.py --all
  python generate_backgrounds.py --route home
  python generate_backgrounds.py --route boosters marketplace wallet
  python generate_backgrounds.py --all --delay 5
  
Available routes:
  home        - Interface Awakening (portal entry)
  boosters    - Digital Bazaar Street (pack store)
  marketplace - Entity Trading Floor (card trading)
  inventory   - Personal Vault Dimension (collection)
  wallet      - Financial Stream (balance/transactions)
        """
    )
    
    parser.add_argument(
        '--all',
        action='store_true',
        help='Generate all backgrounds'
    )
    
    parser.add_argument(
        '--route',
        nargs='+',
        choices=list(BACKGROUNDS.keys()),
        help='Generate specific route(s)'
    )
    
    parser.add_argument(
        '--output-dir',
        default='frontend/public/backgrounds',
        help='Output directory (default: frontend/public/backgrounds)'
    )
    
    parser.add_argument(
        '--model',
        default='imagen-4.0-ultra-generate-001',
        help='Imagen model to use (default: imagen-4.0-ultra-generate-001)'
    )
    
    parser.add_argument(
        '--delay',
        type=int,
        default=3,
        help='Delay in seconds between batch generations (default: 3)'
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.all and not args.route:
        parser.print_help()
        print("\n❌ Error: Must specify --all or --route")
        sys.exit(1)
    
    # Initialize generator
    generator = BackgroundGenerator(output_dir=args.output_dir)
    
    # Generate
    if args.all:
        results = generator.generate_all(model=args.model, delay=args.delay)
        success = all(results.values())
    else:
        results = {}
        for route in args.route:
            results[route] = generator.generate(route, model=args.model)
            if len(args.route) > 1 and route != args.route[-1]:
                time.sleep(args.delay)
        success = all(results.values())
    
    # Exit code
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
