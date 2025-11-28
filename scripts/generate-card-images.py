#!/usr/bin/env python3
"""
Kroova Card Image Generator - Google Gemini API (Nano Banana Pro)
Gera imagens fotorealísticas 4K (1536x2048, 3:4) para todas as 251 cartas ED01
"""

import os
import sys
import json
import time
from typing import Dict, List, Optional
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

# Configuration
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Google Gemini API (Imagen 4) settings for maximum quality
IMAGEN_CONFIG = {
    'model': 'imagen-4.0-generate-001',  # Nano Banana Pro
    'number_of_images': 1,
    'aspect_ratio': '3:4',  # 3:4 aspect ratio (portrait)
    'image_size': '2K',  # Maximum quality (2048px)
    'person_generation': 'allow_adult',
}

# Branding constants from KROOVA_BRANDING.md
BRANDING = {
    'aesthetic': 'cyberpunk, neon, glitch, urban dystopian',
    'colors': 'neon magenta (#FF006D), cyber cyan (#00F0FF), royal amber (#FFC700)',
    'lighting': 'volumetric fog, neon rim lighting, ray tracing reflections',
    'atmosphere': 'dystopian cityscape, holographic interfaces, dark moody',
}

# Lore context from KROOVA_EDITION_01.md
LORE_CONTEXT = "Colapso da Interface, 2025 Brasil, algoritmo vivo, influência digital manifestada em entidades físicas"

# Archetype visual themes
ARCHETYPE_THEMES = {
    'Ganância': 'predatory, calculating, luxury items, financial data, cold expression',
    'Influência': 'charismatic, magnetic, glowing aura, followers, commanding presence',
    'Impulso': 'energetic, chaotic, motion blur, explosive colors, reckless energy',
    'Informação': 'analytical, data streams, holographic screens, cybernetic enhancements',
    'Consumo': 'excessive, overindulgent, surrounded by products, addictive aesthetic',
    'Preguiça': 'lazy, apathetic, dim lighting, slouched posture, comfortable decay',
}


def get_all_cards_from_db() -> List[Dict]:
    """Fetch all ED01 cards from Supabase"""
    import requests
    
    url = f"{SUPABASE_URL}/rest/v1/cards_base"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
    }
    params = {
        'select': 'display_id,name,description,rarity,archetype,influence_score,rarity_score,base_liquidity_brl',
        'edition': 'eq.ED01',
        'order': 'rarity_score.desc,influence_score.desc',
    }
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    cards = response.json()
    
    print(f"✅ Loaded {len(cards)} cards from database")
    return cards


def generate_prompt(card: Dict) -> str:
    """Generate Leonardo.ai prompt based on card data, branding, and lore"""
    
    # Base quality settings
    quality_prefix = "photorealistic 8K render, Unreal Engine 5, ray tracing, volumetric lighting, depth of field"
    
    # Archetype-specific theme
    archetype = card.get('archetype', 'Influência')
    theme = ARCHETYPE_THEMES.get(archetype, 'mysterious, powerful, commanding presence')
    
    # Card-specific description
    name = card.get('name', 'Unknown')
    description = card.get('description', '')
    
    # Build character description
    # Extract key visual elements from description
    character_desc = f"anthropomorphic creature representing {name}"
    if 'jacaré' in description.lower() or 'crocodile' in name.lower():
        character_desc = "anthropomorphic crocodile"
    elif any(word in description.lower() for word in ['gato', 'cat', 'felino']):
        character_desc = "anthropomorphic cat"
    elif any(word in description.lower() for word in ['pássaro', 'bird', 'corvo', 'crow']):
        character_desc = "anthropomorphic bird"
    elif any(word in description.lower() for word in ['raposa', 'fox']):
        character_desc = "anthropomorphic fox"
    
    # Construct full prompt
    prompt = f"""{quality_prefix}, {character_desc}, {theme}, 
tactical cyberpunk outfit, holographic interfaces floating around, 
{BRANDING['aesthetic']}, {BRANDING['lighting']},
neon-lit dystopian cityscape background, cinematic composition,
digital glitch effects, iridescent accents, {BRANDING['colors']},
sharp focus on character, atmospheric particles,
subsurface scattering, photorealistic details, 
{LORE_CONTEXT}, portrait orientation 3:4 aspect ratio"""
    
    # Clean up extra whitespace
    prompt = ' '.join(prompt.split())
    
    return prompt


def generate_negative_prompt() -> str:
    """Negative prompt to avoid unwanted elements"""
    return """cartoon, anime, illustration, painting, drawing, sketch, 
low quality, blurry, pixelated, jpeg artifacts, watermark, text, logo,
childish, cute, kawaii, simplified, flat colors, 2D,
oversaturated, overexposed, ugly, distorted, deformed"""


def create_generation(prompt: str, card: Dict, client: genai.Client) -> Optional[Dict]:
    """Generate image using Google Gemini API (Imagen 4)"""
    
    try:
        response = client.models.generate_images(
            model=IMAGEN_CONFIG['model'],
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=IMAGEN_CONFIG['number_of_images'],
                aspect_ratio=IMAGEN_CONFIG['aspect_ratio'],
                image_size=IMAGEN_CONFIG['image_size'],
                person_generation=IMAGEN_CONFIG['person_generation'],
                negative_prompt=generate_negative_prompt(),
            )
        )
        
        if response.generated_images and len(response.generated_images) > 0:
            image = response.generated_images[0]
            print(f"  ✅ Image generated successfully")
            return {
                'image': image.image,
                'prompt': prompt,
            }
        else:
            print(f"  ❌ No images generated")
            return None
        
    except Exception as e:
        print(f"  ❌ Error generating image: {e}")
        return None


def save_image(image, card_id: str, output_dir: Path) -> Optional[Path]:
    """Save PIL Image to file"""
    
    try:
        filepath = output_dir / f"{card_id}.png"
        image.save(filepath, 'PNG')
        
        print(f"  ✅ Saved: {filepath}")
        return filepath
        
    except Exception as e:
        print(f"  ❌ Error saving image: {e}")
        return None


def update_card_image_url(card_id: str, image_url: str):
    """Update card's image_url in database"""
    import requests
    
    url = f"{SUPABASE_URL}/rest/v1/cards_base"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
    }
    params = {'display_id': f'eq.{card_id}'}
    payload = {'image_url': image_url}
    
    try:
        response = requests.patch(url, headers=headers, params=params, json=payload)
        response.raise_for_status()
        print(f"  ✅ Updated database with image URL")
        
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Error updating database: {e}")


def generate_card_image(card: Dict, output_dir: Path, client: genai.Client, delay: int = 2) -> bool:
    """Generate image for a single card"""
    
    card_id = card['display_id']
    name = card['name']
    
    print(f"\n🎨 Generating: {name} ({card_id})")
    print(f"   Rarity: {card['rarity']} | Archetype: {card['archetype']}")
    print(f"   Scores: Influence={card['influence_score']}, Rarity={card['rarity_score']}")
    
    # Generate prompt
    prompt = generate_prompt(card)
    print(f"   Prompt: {prompt[:100]}...")
    
    # Generate image (synchronous with Gemini API)
    result = create_generation(prompt, card, client)
    if not result:
        return False
    
    # Save image
    image_path = save_image(result['image'], card_id, output_dir)
    
    if image_path:
        # Update database with public URL
        public_url = f"/cards/{card_id}.png"
        update_card_image_url(card_id, public_url)
        
        print(f"  ⏱ Waiting {delay}s before next generation...")
        time.sleep(delay)
        return True
    else:
        return False


def main():
    """Main execution"""
    
    print("🚀 Kroova Card Image Generator")
    print("=" * 60)
    print(f"Model: Google Imagen 4 (Nano Banana Pro)")
    print(f"Resolution: 2K (3:4 aspect ratio)")
    print(f"Quality: Maximum photorealistic")
    print("=" * 60)
    
    # Check environment variables
    if not GOOGLE_API_KEY:
        print("\n❌ ERROR: GOOGLE_API_KEY not found")
        print("   Get your key at: https://aistudio.google.com/apikey")
        print("   Set it in .env file or environment variable")
        sys.exit(1)
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("\n❌ ERROR: Supabase credentials not found")
        sys.exit(1)
    
    # Initialize Gemini client
    client = genai.Client(api_key=GOOGLE_API_KEY)
    print("✅ Gemini API client initialized")
    
    # Create output directory
    output_dir = Path('public/cards')
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"📁 Output directory: {output_dir.absolute()}")
    
    # Load cards from database
    print("\n📚 Loading cards from database...")
    cards = get_all_cards_from_db()
    
    if not cards:
        print("❌ No cards found in database")
        sys.exit(1)
    
    # Estimate cost (Gemini API pricing)
    # Imagen 4: ~$0.02-0.04 per image for 2K
    cost_per_image = 0.03
    estimated_cost = len(cards) * cost_per_image
    
    print(f"\n💰 Cost Estimate:")
    print(f"   Cards: {len(cards)}")
    print(f"   Cost per image: ~${cost_per_image}")
    print(f"   Estimated total: ~${estimated_cost:.2f} USD")
    print(f"   (Much cheaper than Leonardo.ai ~$125!)")
    
    # Confirm before starting
    response = input("\n⚠️  Continue? (yes/no): ").strip().lower()
    if response != 'yes':
        print("❌ Aborted")
        sys.exit(0)
    
    # Generate images
    print("\n🎨 Starting generation...")
    successful = 0
    failed = 0
    
    for i, card in enumerate(cards, 1):
        print(f"\n[{i}/{len(cards)}] Processing {card['name']}...")
        
        if generate_card_image(card, output_dir, client, delay=2):
            successful += 1
        else:
            failed += 1
            print(f"  ⚠️  Failed, continuing to next card...")
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ GENERATION COMPLETE")
    print(f"   Successful: {successful}")
    print(f"   Failed: {failed}")
    print(f"   Total: {len(cards)}")
    print(f"   Estimated cost: ~${successful * cost_per_image:.2f} USD")
    print("=" * 60)


if __name__ == '__main__':
    main()
