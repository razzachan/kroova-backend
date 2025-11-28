#!/usr/bin/env python3
"""
Kroova Card Image Generator - Google Gemini API (Nano Banana Pro)
Gera imagens fotorealísticas 4K (3:4 aspect ratio) para todas as 251 cartas ED01
usando Imagen 4 via Google Gemini API

🎯 CRITICAL: Each card gets a UNIQUE prompt based on its COMPLETE description
   - Not generic templates, but SPECIFIC visual narratives
   - Props, objects, poses extracted from card story
   - Character design reflects their actual personality/lore
"""

import os
import sys
import time
import re
import json
import unicodedata
import argparse
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Import after environment is loaded
try:
    from google import genai
    from google.genai import types
    import requests
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    print("   Install with: pip install google-genai requests python-dotenv")
    sys.exit(1)

# Google Gemini API (Imagen 4) settings
IMAGEN_CONFIG = {
    'model': 'imagen-4.0-ultra-generate-001',  # default model (can be overridden via --model)
    'number_of_images': 1,
    'aspect_ratio': '3:4',  # Portrait orientation
    'image_size': '2K',  # Maximum quality (2048px)
    'person_generation': 'allow_adult',
}

# Branding constants from KROOVA_BRANDING.md
BRANDING = {
    'aesthetic': 'cyberpunk, neon, glitch, urban dystopian, meme culture, internet aesthetic',
    'colors': 'neon magenta (#FF006D), cyber cyan (#00F0FF), royal amber (#FFC700)',
    'lighting': 'volumetric fog, neon rim lighting, dramatic lighting',
    'atmosphere': 'dystopian cityscape, holographic interfaces, dark moody',
    'essence': 'MEME + CYBERPUNK + CULTURA POP fusion, satirical, stylish, internet-native',
}

# -------------------- Quota handling --------------------
class QuotaExceededError(Exception):
    pass

# Lore context from KROOVA_EDITION_01.md
LORE_CONTEXT = "Colapso da Interface 2025 Brasil, algoritmo vivo, influência digital manifestada, entidades nascidas do vício coletivo em redes sociais"

# Archetype visual themes (BASE aesthetic, not the entire character)
ARCHETYPE_THEMES = {
    'Ganância': 'predatory calculating energy, financial obsession visible',
    'Influência': 'magnetic charismatic presence, attention-commanding aura',
    'Impulso': 'chaotic explosive energy, impulsive unpredictable movement',
    'Informação': 'analytical data-driven aesthetic, tech-focused',
    'Consumo': 'excessive indulgent energy, surrounded by excess',
    'Preguiça': 'apathetic lazy vibe, low-energy comfortable decay',
}


def get_all_cards_from_db() -> List[Dict]:
    """Fetch all ED01 cards from Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/cards_base"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8',
    }
    params = {
        'select': 'display_id,name,description,rarity,archetype,influence_score,rarity_score,base_liquidity_brl',
        'order': 'rarity_score.desc,influence_score.desc',
    }

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    response.encoding = 'utf-8'  # Force UTF-8 encoding
    cards = response.json()

    # Filter ED01 cards in Python (avoid Supabase filter issues)
    cards = [c for c in cards if 'crd_' in c.get('display_id', '')]
    
    print(f"✅ Loaded {len(cards)} cards from database")
    return cards


# -------------------- Data Sanitization & Validation --------------------
CONTROL_CHAR_PATTERN = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]")

def sanitize_string(value: Optional[str]) -> str:
    """Return a clean UTF-8 safe string suitable for prompt usage and logging."""
    if value is None:
        return ""
    if not isinstance(value, str):
        value = str(value)
    # Normalize accents & compatibility forms
    value = unicodedata.normalize("NFKC", value)
    # Remove control characters except common whitespace
    value = CONTROL_CHAR_PATTERN.sub("", value)
    # Collapse internal whitespace
    value = re.sub(r"\s+", " ", value).strip()
    return value

def detect_name_issue(name: str) -> Optional[str]:
    """Return issue description if name looks malformed else None."""
    if name == "" or name.lower() in {"null", "none"}:
        return "empty"
    if "�" in name:
        return "replacement_char"
    if len(name) > 80:
        return "too_long"
    if re.fullmatch(r"[0-9_]+", name):
        return "only_numeric_or_underscore"
    if re.search(r"\s{2,}", name):
        return "double_spaces"
    return None

def validate_and_fix_cards(cards: List[Dict]) -> Tuple[List[Dict], Dict[str,int], List[Tuple[str,str]]]:
    """Sanitize string fields and report anomalies for names.

    Returns: (updated_cards, issue_counts, samples)
    samples: list of (display_id, issue) for first occurrences.
    """
    issue_counts: Dict[str,int] = {}
    samples: List[Tuple[str,str]] = []
    for c in cards:
        # Sanitize fields
        for field in ["display_id", "name", "description", "archetype", "rarity"]:
            if field in c:
                c[field] = sanitize_string(c.get(field))
        # Validate name
        issue = detect_name_issue(c.get("name", ""))
        if issue:
            issue_counts[issue] = issue_counts.get(issue, 0) + 1
            if len(samples) < 15:  # collect some examples
                samples.append((c.get("display_id", "?"), issue))
            # Attempt auto-fix for certain issues
            if issue == "empty":
                base = c.get("display_id", "card")
                c["name"] = f"Card {base}" if base else "Card Sem Nome"
            elif issue == "replacement_char":
                # Heuristic: remove replacement chars
                c["name"] = c["name"].replace("�", "") or "Nome Corrompido"
            elif issue == "double_spaces":
                c["name"] = re.sub(r"\s{2,}", " ", c["name"]).strip()
            elif issue == "too_long":
                c["name"] = c["name"][:77] + "…"
            elif issue == "only_numeric_or_underscore":
                c["name"] = f"Card {c['display_id']}"
    return cards, issue_counts, samples


def generate_prompt(card: Dict) -> str:
    """
    🎯 Generate RADICALLY UNIQUE prompt for EACH card
    
    ZERO templates. The description IS the character.
    Let the AI interpret the story freely without forcing anatomy/species.
    """
    
    # Card data
    name = card.get('name', 'Unknown')
    description = card.get('description', '')
    archetype = card.get('archetype', 'Influência')
    rarity = card.get('rarity', 'meme')
    influence = card.get('influence_score', 50)
    display_id = card.get('display_id', '')
    
    # 🎯 CORE: The FULL description drives EVERYTHING
    story = description if description else f"Personifica {name}, entidade do arquétipo {archetype}"
    
    # Hash display_id to get consistent per-card variation seeds
    import hashlib
    seed = int(hashlib.md5(display_id.encode()).hexdigest()[:8], 16) % 100
    
    # Per-card technical variation (not uniform)
    angles = [
        "straight-on portrait", "slight side angle", "three-quarter view", 
        "low angle looking up", "eye-level candid shot", "tilted dynamic angle"
    ]
    lighting_styles = [
        "harsh neon backlighting", "soft volumetric fog glow", 
        "dramatic side rim lighting", "overhead spotlight with shadows",
        "ambient glow from screens", "colored gel lighting magenta and cyan"
    ]
    environments = [
        "dark alley with neon signs", "cramped gaming arcade interior",
        "dystopian favela rooftop at night", "abandoned mall corridor",
        "underground data center", "cluttered bedroom lit by screens",
        "grimy street corner", "holographic billboard backdrop"
    ]
    
    angle = angles[seed % len(angles)]
    lighting = lighting_styles[(seed // 2) % len(lighting_styles)]
    environment = environments[(seed // 3) % len(environments)]
    
    # Rarity → production style (not heroism)
    production = {
        'godmode': 'cinematic 8K ultra-detailed textures, professional color grading',
        'legendary': 'high-end photorealistic render, premium lighting setup',
        'viral': 'polished digital photography, sharp focus, good composition',
        'meme': 'raw authentic look, smartphone photo aesthetic, candid realism'
    }.get(rarity, 'realistic photo capture')
    
    # Influence → framing/presence (not power level)
    framing = "fills frame confidently, impossible to ignore" if influence > 75 else \
              "well-framed subject, naturally draws attention" if influence > 50 else \
              "partially obscured, blends into background" if influence > 25 else \
              "barely visible, fading into shadows"
    
    # Extract ONLY specific props from description (no anatomy forcing)
    desc_lower = (description or '').lower()
    props = []
    
    # Tech/digital props
    if any(w in desc_lower for w in ['tablet', 'tela', 'monitor', 'celular', 'phone']):
        props.append('holding glowing device with holographic interface')
    if any(w in desc_lower for w in ['algoritmo', 'código', 'data', 'binary']):
        props.append('floating code streams and data visualizations around them')
    if any(w in desc_lower for w in ['coroa', 'crown', 'rei', 'king']):
        props.append('digital crown projection above head')
    
    # Social media props
    if any(w in desc_lower for w in ['likes', 'curtidas', 'coração', 'heart']):
        props.append('floating like icons and hearts surrounding character')
    if any(w in desc_lower for w in ['thread', 'post', 'tweet', 'comment']):
        props.append('holographic social media posts hovering nearby')
    if any(w in desc_lower for w in ['influencer', 'celebridade', 'famoso']):
        props.append('follower count and engagement metrics displayed')
    
    # Financial/consumption props
    if any(w in desc_lower for w in ['trader', 'crypto', 'moeda', 'coin', 'gráfico']):
        props.append('financial charts and cryptocurrency symbols floating')
    if any(w in desc_lower for w in ['dinheiro', 'money', 'cash', 'grana', 'rico']):
        props.append('currency symbols and cash imagery swirling around')
    if any(w in desc_lower for w in ['luxo', 'ostentação', 'designer', 'marca']):
        props.append('luxury brand items and status symbols visible')
    if any(w in desc_lower for w in ['consumo', 'shopping', 'compra', 'produto']):
        props.append('surrounded by product packaging and shopping imagery')
    
    # Emotional/state props
    if any(w in desc_lower for w in ['viciado', 'addiction', 'dependente']):
        props.append('desperate anxious body language, twitchy hands')
    if any(w in desc_lower for w in ['cansado', 'burnout', 'exausto', 'tired']):
        props.append('exhausted slumped posture, heavy dark circles')
    if any(w in desc_lower for w in ['preguiça', 'lazy', 'apático', 'relaxed']):
        props.append('extremely casual slouched pose, minimal effort')
    if any(w in desc_lower for w in ['impulsivo', 'caótico', 'frenético', 'wild']):
        props.append('frantic chaotic energy, motion blur effects')
    if any(w in desc_lower for w in ['fake', 'falso', 'máscara', 'performance']):
        props.append('forced artificial smile, theatrical fake expression')
    
    # Visual effects props
    if any(w in desc_lower for w in ['ghost', 'fantasma', 'invisível', 'fading']):
        props.append('semi-transparent ethereal fading visual effect')
    if any(w in desc_lower for w in ['glitch', 'bug', 'erro', 'corrupted']):
        props.append('digital glitch artifacts and pixel corruption')
    
    props_string = ', '.join(props) if props else ''
    
    # 🔥 FICTIONAL CREATURE DESIGN: Name + Story = Unique Visual DNA
    prompt = f"""FICTIONAL CHARACTER DESIGN (not human photography), {production}, {framing},

CHARACTER NAME: {name}
STORY/PERSONALITY: {story}

Design a COMPLETELY FICTIONAL CREATURE/CHARACTER for "{name}" that VISUALLY EMBODIES this story. This is CHARACTER ART, not a photo of a real person.

VISUAL INSPIRATION FROM NAME AND STORY:
- Let the NAME suggest visual forms (word associations, phonetics, cultural references)
- Let the STORY define anatomy, proportions, textures, features
- Allow SURREAL, IMPOSSIBLE, HYBRID forms (animal/digital/abstract fusion)
- Each character should look RADICALLY DIFFERENT from others
- MEME aesthetic = exaggerated features, viral-worthy design, internet culture DNA
- Can be cute, grotesque, silly, creepy, stylish - whatever fits THEIR vibe

SETTING: {environment}, {lighting}, {angle}, dystopian Brazil 2025, neon magenta (#FF006D) and cyan (#00F0FF) lighting, atmospheric haze and volumetric fog

VISUAL ELEMENTS: {props_string}

STYLE DIRECTIVES:
- CYBERPUNK + MEME CULTURE + POP BRASILEIRO fusion
- Internet-native aesthetic (glitch, digital artifacts, holographic elements)
- Satirical edge, stylish chaos, flawed authenticity
- Decorative text/patches/stickers/brand logos on character OK (like streetwear)
- NOT superhero, NOT idealized, NOT generic animal template
- Each character is a UNIQUE ORIGINAL DESIGN

TECHNICAL: portrait 3:4 aspect ratio, character-focused composition, cinematic lighting
FORBIDDEN: zero text overlays on image, no character name written in scene, no captions, no labels - clean character art only

This is "{name}" - make them VISUALLY UNFORGETTABLE and UNIQUE."""

    return ' '.join(prompt.split())


def create_generation(prompt: str, card: Dict, client: genai.Client, model: str) -> Optional[Dict]:
    """Generate image using Google Gemini API (Imagen 4)"""
    
    try:
        # Some variants (fast/ultra) don't allow adjustable image_size; omit when necessary
        model_lc = (model or '').lower()
        config_kwargs = dict(
            number_of_images=IMAGEN_CONFIG['number_of_images'],
            aspect_ratio=IMAGEN_CONFIG['aspect_ratio'],
            person_generation=IMAGEN_CONFIG['person_generation'],
        )
        if 'fast' not in model_lc and 'ultra' not in model_lc:
            config_kwargs['image_size'] = IMAGEN_CONFIG['image_size']

        response = client.models.generate_images(
            model=model,
            prompt=prompt,
            config=types.GenerateImagesConfig(**config_kwargs)
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
        msg = str(e)
        # Detect quota exhaustion and propagate a specific exception
        if 'RESOURCE_EXHAUSTED' in msg or '429' in msg or 'quota' in msg.lower():
            raise QuotaExceededError(msg)
        print(f"  ❌ Error generating image: {msg}")
        return None


def save_image(image, card_id: str, output_dir: Path) -> Optional[Path]:
    """Save PIL Image to file"""

    try:
        filepath = output_dir / f"{card_id}.png"
        # image is already a PIL.Image object from Gemini API
        image.save(filepath)

        print(f"  ✅ Saved: {filepath}")
        return filepath

    except Exception as e:
        print(f"  ❌ Error saving image: {e}")
        return None


def update_card_image_url(card_id: str, image_url: str):
    """Update card's image_url in database"""

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


def generate_card_image(card: Dict, output_dir: Path, client: genai.Client, model: str, delay: int = 2) -> bool:
    """Generate image for a single card"""

    card_id = card['display_id']
    name = card['name']

    print(f"\n🎨 Generating: {name} ({card_id})")
    print(f"   Rarity: {card['rarity']} | Archetype: {card['archetype']}")
    print(f"   Scores: Influence={card['influence_score']}, Rarity={card['rarity_score']}")
    
    # Generate UNIQUE prompt based on card's story
    prompt = generate_prompt(card)
    print(f"   Story-based prompt: {prompt[:100]}...")

    # Generate image (synchronous with Gemini API)
    result = create_generation(prompt, card, client, model)
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


def save_resume_state(filepath: Path, next_start_index: int, total_cards: int) -> None:
    state = {
        'next_start': next_start_index,
        'total_cards': total_cards,
        'timestamp': int(time.time())
    }
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
        print(f"💾 Saved resume state: next_start={next_start_index}")
    except Exception as e:
        print(f"⚠️  Failed to save resume state: {e}")

def load_resume_state(filepath: Path) -> Optional[int]:
    try:
        if filepath.exists():
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            ns = int(data.get('next_start', 1))
            print(f"📄 Found resume state: next_start={ns}")
            return ns
    except Exception as e:
        print(f"⚠️  Failed to load resume state: {e}")
    return None


def main():
    """Main execution"""

    print("🚀 Kroova Card Image Generator - UNIQUE DESIGN MODE")
    print("=" * 70)
    print(f"Model: Google Imagen 4 (Nano Banana Pro)")
    print(f"Aspect Ratio: 3:4 (portrait)")
    print(f"Quality: 2K (maximum photorealistic)")
    print(f"🎯 Each card gets UNIQUE prompt based on its story")
    print("=" * 70)

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
    try:
        client = genai.Client(api_key=GOOGLE_API_KEY)
        print("✅ Gemini API client initialized")
    except Exception as e:
        print(f"❌ Error initializing Gemini client: {e}")
        sys.exit(1)

    # Determine output directory (default: scripts/public/cards)
    default_out = Path(__file__).parent / 'public' / 'cards'
    
    print(f"\n📚 Loading cards from database...")
    cards = get_all_cards_from_db()

    if not cards:
        print("❌ No cards found in database")
        sys.exit(1)

    print(f"\n🔍 Validando nomes e descrições...")
    cards, issue_counts, samples = validate_and_fix_cards(cards)
    if issue_counts:
        print("⚠️  Anomalias detectadas em nomes:")
        for k,v in issue_counts.items():
            print(f"   - {k}: {v}")
        if samples:
            print("   Exemplos:")
            for display_id, issue in samples:
                print(f"     • {display_id}: {issue}")
    else:
        print("✅ Nenhuma anomalia de nome detectada")

    print(f"\n✅ Ready to generate {len(cards)} cards with UNIQUE designs")

    # -------------------- CLI ARG PARSE (resume support) --------------------
    parser = argparse.ArgumentParser(description="Kroova Card Image Generator")
    parser.add_argument('--start', type=int, default=None, help='1-based card position to start generating from')
    parser.add_argument('--limit', type=int, default=None, help='Maximum number of cards to generate')
    parser.add_argument('--yes', action='store_true', help='Skip interactive confirmation prompt')
    parser.add_argument('--resume', action='store_true', help='Resume from saved resume_state.json if present')
    parser.add_argument('--model', type=str, default=IMAGEN_CONFIG['model'], help='Model id or shorthand: generate|fast|ultra')
    parser.add_argument('--fallback-models', type=str, default='', help='Comma-separated list of fallback models (e.g., fast,ultra)')
    parser.add_argument('--out-dir', type=str, default=None, help='Directory to save images (default: scripts/public/cards)')
    args = parser.parse_args()

    def resolve_model(name: str) -> str:
        name = (name or '').strip().lower()
        aliases = {
            'generate': 'imagen-4.0-generate-001',
            'imagen-4.0-generate': 'imagen-4.0-generate-001',
            'fast': 'imagen-4.0-fast-generate-001',
            'imagen-4.0-fast-generate': 'imagen-4.0-fast-generate-001',
            'ultra': 'imagen-4.0-ultra-generate-001',
            'imagen-4.0-ultra-generate': 'imagen-4.0-ultra-generate-001',
        }
        return aliases.get(name, name)

    current_model = resolve_model(args.model)
    fallback_models = [resolve_model(m) for m in args.fallback_models.split(',') if m.strip()] if args.fallback_models else []
    print(f"🧠 Using model: {current_model}")
    if fallback_models:
        print(f"   Fallbacks: {', '.join(fallback_models)}")

    # Resolve output directory now that args are parsed
    output_dir = Path(args.out_dir) if args.out_dir else default_out
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"📁 Output directory: {output_dir.absolute()}")

    # Determine starting position
    start_pos = args.start if args.start and args.start > 0 else None
    resume_file = Path('resume_state.json')
    if args.resume and not start_pos:
        loaded = load_resume_state(resume_file)
        if loaded:
            start_pos = loaded
    if start_pos and start_pos > len(cards):
        print(f"❌ --start {start_pos} exceeds total cards {len(cards)}")
        sys.exit(1)

    # Confirmation (skip if --yes)
    if not args.yes:
        response = input("\n⚠️  Continue? (yes/no): ").strip().lower()
        if response != 'yes':
            print("❌ Aborted")
            sys.exit(0)
    else:
        print("\n⚠️  Auto-continue (--yes provided)")
    # Estimate cost (Gemini API pricing for Imagen)
    cost_per_image = 0.03
    estimated_cost = len(cards) * cost_per_image

    print(f"\n💰 Cost Estimate:")
    print(f"   Cards: {len(cards)}")
    print(f"   Cost per image: ~${cost_per_image}")
    print(f"   Estimated total: ~${estimated_cost:.2f} USD")
    print(f"   🎉 Much cheaper than Leonardo.ai (~$125)!")
    
    # Determine slice based on --start / --limit
    skip_count = (start_pos - 1) if start_pos else 0
    cards_slice = cards[skip_count:]
    if args.limit:
        cards_slice = cards_slice[:args.limit]

    actual_count = len(cards_slice)
    start_index = skip_count + 1

    print("\n🎨 Starting generation with UNIQUE prompts per card...")
    if start_pos:
        print(f"🔄 Resuming at card {start_pos} (display index) ...")
    if args.limit:
        print(f"🔄 Limiting to {actual_count} cards this run")

    successful = 0
    failed = 0

    for i, card in enumerate(cards_slice, start_index):
        print(f"\n{'='*70}")
        print(f"[{i}/{len(cards)}] Processing {card['name']} ({card['display_id']})...")
        
        try:
            # Try current model; on quota switch to next fallback automatically
            while True:
                try:
                    if generate_card_image(card, output_dir, client, current_model, delay=2):
                        successful += 1
                    else:
                        failed += 1
                        print(f"  ⚠️  Failed, continuing to next card...")
                    break
                except QuotaExceededError as qe_inner:
                    if fallback_models:
                        next_model = fallback_models.pop(0)
                        print(f"⛽ Quota hit for model {current_model}. Switching to fallback: {next_model}")
                        current_model = next_model
                        continue  # retry same card with new model
                    else:
                        raise
        except QuotaExceededError as qe:
            print("\n⛔ Quota reached (429/RESOURCE_EXHAUSTED). Stopping gracefully.")
            next_start = i  # resume from current index next time
            save_resume_state(resume_file, next_start_index=next_start, total_cards=len(cards))
            print("Tip: resume tomorrow with → python scripts\\generate-card-images-gemini.py --resume --yes")
            break
    
    # Summary
    print("\n" + "=" * 70)
    print("✅ GENERATION COMPLETE")
    print(f"   Successful: {successful}")
    print(f"   Failed: {failed}")
    print(f"   Total: {len(cards)}")
    print(f"   Actual cost: ~${successful * cost_per_image:.2f} USD")
    print("=" * 70)


if __name__ == '__main__':
    main()
