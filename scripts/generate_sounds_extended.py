#!/usr/bin/env python3
"""
KROOVA Audio System - Extended Generation Script
Generates extended ambient loops + UI sound effects using ElevenLabs API

New Sounds:
1. Extended Ambient Loops (60s instead of 30s)
   - ambient_idle_extended.mp3
   - ambient_active_extended.mp3
   - ambient_intense_extended.mp3

2. UI Sound Effects (instant feedback)
   - ui_click_cyber.mp3
   - ui_hover_glitch.mp3
   - ui_success_chime.mp3
   - ui_error_buzz.mp3

3. Interaction Sounds (events)
   - card_materialize.mp3
   - reality_tear.mp3 (modal open)
   - data_flow.mp3(input typing)
   - portal_open.mp3 (navigation)

Usage:
    python generate_sounds_extended.py --all
    python generate_sounds_extended.py --category ambient
    python generate_sounds_extended.py --category ui
    python generate_sounds_extended.py --category interactions
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import Dict, List
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
if not ELEVENLABS_API_KEY:
    print("❌ ELEVENLABS_API_KEY not set in environment")
    print("   Add it to .env file: ELEVENLABS_API_KEY=your_key_here")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("❌ Missing requests library")
    print("   Install with: pip install requests")
    sys.exit(1)

# ====== SOUND CONFIGURATIONS ======

AMBIENT_EXTENDED = {
    'ambient_idle_extended': {
        'name': 'Idle Ambient Extended',
        'prompt': """
Create a 30-second loopable ambient soundscape for an idle cyberpunk interface.
Subtle city hum, distant digital echoes, very minimal neon flicker buzz, 
low-frequency atmospheric drone, extremely sparse and calm, perfect for 
background listening without distraction, seamless loop, no sharp sounds,
volume level: quiet 0.1, mood: contemplative digital void
        """.strip(),
        'duration': 30,
        'volume': 0.1,
        'loop': True,
    },
    'ambient_active_extended': {
        'name': 'Active Ambient Extended',
        'prompt': """
Create a 30-second loopable ambient soundscape for active browsing in 
cyberpunk interface. Medium energy with subtle rhythmic data pulse, 
occasional neon buzz, digital wind flowing through circuits, light
synthetic percussion hints, engaging but not distracting, seamless loop,
volume level: moderate 0.25, mood: focused exploration
        """.strip(),
        'duration': 30,
        'volume': 0.25,
        'loop': True,
    },
    'ambient_intense_extended': {
        'name': 'Intense Ambient Extended',
        'prompt': """
Create a 30-second loopable high-energy ambient for intense moments in
cyberpunk interface. Strong rhythmic data streams, prominent neon hum,
digital storm building tension, cyberpunk urgency, pulsing bass undertones,
maintains excitement without overwhelming, seamless loop, volume level: high 0.4,
mood: adrenaline rush cyberpunk action
        """.strip(),
        'duration': 30,
        'volume': 0.4,
        'loop': True,
    },
}

UI_SOUNDS = {
    'ui_click_cyber': {
        'name': 'Cyber Click',
        'prompt': 'Short crisp cyber click sound, 0.1s, digital button press, satisfying feedback',
        'duration': 0.5,
        'volume': 0.3,
    },
    'ui_hover_glitch': {
        'name': 'Hover Glitch',
        'prompt': 'Subtle digital glitch on hover, 0.15s, brief static burst, minimal but noticeable',
        'duration': 0.5,
        'volume': 0.2,
    },
    'ui_success_chime': {
        'name': 'Success Chime',
        'prompt': 'Bright cyber success chime, 0.8s, neon activation sound, positive feedback, futuristic',
        'duration': 1.0,
        'volume': 0.4,
    },
    'ui_error_buzz': {
        'name': 'Error Buzz',
        'prompt': 'Digital error buzz, 0.5s, warning tone, harsh but not painful, cyberpunk alert',
        'duration': 0.8,
        'volume': 0.35,
    },
}

INTERACTION_SOUNDS = {
    'card_materialize': {
        'name': 'Card Materialize',
        'prompt': 'Holographic card materializing from digital void, 1.5s, particles coalescing, cyber magic',
        'duration': 2.0,
        'volume': 0.5,
    },
    'reality_tear': {
        'name': 'Reality Tear',
        'prompt': 'Reality tearing open for modal, 1s, dimensional rift, cyber portal opening, dramatic',
        'duration': 1.5,
        'volume': 0.45,
    },
    'data_flow': {
        'name': 'Data Flow',
        'prompt': 'Data flowing through input field, 0.8s, digital stream, typing feedback, subtle pulse',
        'duration': 1.0,
        'volume': 0.25,
    },
    'portal_open': {
        'name': 'Portal Open',
        'prompt': 'Navigation portal opening, 1.2s, dimensional transition, cyber teleport, smooth whoosh',
        'duration': 1.5,
        'volume': 0.4,
    },
}

# ====== GENERATOR ======

def generate_sound(sound_key: str, config: Dict, output_dir: str, category: str) -> bool:
    """Generate a single sound via ElevenLabs API"""
    
    output_path = Path(output_dir) / f"{sound_key}.mp3"
    
    print(f"\n{'='*70}")
    print(f"🎵 Generating: {config['name']}")
    print(f"   Category: {category}")
    print(f"   Duration: {config['duration']}s")
    print(f"   Volume: {config['volume']}")
    print(f"   Output: {output_path}")
    print(f"{'='*70}\n")
    
    try:
        # ElevenLabs Sound Effects API endpoint
        url = "https://api.elevenlabs.io/v1/sound-generation"
        
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
        }
        
        data = {
            "text": config['prompt'],
            "duration_seconds": config.get('duration', 2.0),
            "prompt_influence": 0.5,
        }
        
        print("📝 Prompt:")
        print(config['prompt'][:200] + "..." if len(config['prompt']) > 200 else config['prompt'])
        print()
        
        print(f"⏳ Generating with ElevenLabs (5-15 seconds)...")
        start_time = time.time()
        
        response = requests.post(url, headers=headers, json=data)
        
        generation_time = time.time() - start_time
        
        if response.status_code == 200:
            print(f"✅ Generated in {generation_time:.1f}s")
            
            # Save MP3
            with open(output_path, 'wb') as f:
                f.write(response.content)
            
            file_size_kb = output_path.stat().st_size / 1024
            print(f"💾 Saved: {output_path}")
            print(f"   Size: {file_size_kb:.2f} KB")
            
            return True
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def generate_category(category: str, output_dir: str) -> Dict[str, bool]:
    """Generate all sounds in a category"""
    
    sound_dict = {
        'ambient': AMBIENT_EXTENDED,
        'ui': UI_SOUNDS,
        'interactions': INTERACTION_SOUNDS,
    }.get(category)
    
    if not sound_dict:
        print(f"❌ Unknown category: {category}")
        return {}
    
    results = {}
    total = len(sound_dict)
    
    print(f"\n{'='*70}")
    print(f"🚀 CATEGORY: {category.upper()}")
    print(f"   Sounds: {total}")
    print(f"{'='*70}")
    
    for i, (sound_key, config) in enumerate(sound_dict.items(), 1):
        print(f"\n[{i}/{total}] Processing {sound_key}...")
        success = generate_sound(sound_key, config, output_dir, category)
        results[sound_key] = success
        
        if i < total and success:
            print(f"\n⏸️  Waiting 2s before next generation...")
            time.sleep(2)
    
    return results

def generate_all(output_dir: str) -> Dict[str, Dict[str, bool]]:
    """Generate all sounds across all categories"""
    
    all_results = {}
    
    for category in ['ambient', 'ui', 'interactions']:
        print(f"\n\n{'#'*70}")
        print(f"# CATEGORY: {category.upper()}")
        print(f"{'#'*70}\n")
        
        results = generate_category(category, output_dir)
        all_results[category] = results
        
        print(f"\n⏸️  Waiting 3s before next category...")
        time.sleep(3)
    
    return all_results

def print_summary(results: Dict):
    """Print generation summary"""
    
    print(f"\n\n{'='*70}")
    print(f"📊 GENERATION SUMMARY")
    print(f"{'='*70}\n")
    
    if isinstance(list(results.values())[0], dict):
        # Multi-category results
        for category, category_results in results.items():
            total = len(category_results)
            successful = sum(1 for v in category_results.values() if v)
            failed = total - successful
            
            print(f"{category.upper()}:")
            print(f"  ✅ Successful: {successful}/{total}")
            if failed > 0:
                failed_sounds = [k for k, v in category_results.items() if not v]
                print(f"  ❌ Failed: {failed}/{total}")
                print(f"     Files: {', '.join(failed_sounds)}")
            print()
    else:
        # Single category results
        total = len(results)
        successful = sum(1 for v in results.values() if v)
        failed = total - successful
        
        print(f"✅ Successful: {successful}/{total}")
        if failed > 0:
            failed_sounds = [k for k, v in results.items() if not v]
            print(f"❌ Failed: {failed}/{total}")
            print(f"   Files: {', '.join(failed_sounds)}")

# ====== CLI ======

def main():
    parser = argparse.ArgumentParser(
        description='Generate extended audio for KROOVA Living Interface',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    
    parser.add_argument(
        '--all',
        action='store_true',
        help='Generate all sounds (ambient + ui + interactions)'
    )
    
    parser.add_argument(
        '--category',
        choices=['ambient', 'ui', 'interactions'],
        help='Generate specific category'
    )
    
    parser.add_argument(
        '--output-dir',
        default='frontend/public/sfx',
        help='Output directory (default: frontend/public/sfx)'
    )
    
    args = parser.parse_args()
    
    if not args.all and not args.category:
        parser.print_help()
        print("\n❌ Error: Must specify --all or --category")
        sys.exit(1)
    
    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate
    if args.all:
        results = generate_all(str(output_dir))
    else:
        results = generate_category(args.category, str(output_dir))
    
    # Summary
    print_summary(results)
    
    # Exit code
    if args.all:
        all_success = all(all(r.values()) for r in results.values())
    else:
        all_success = all(results.values())
    
    sys.exit(0 if all_success else 1)

if __name__ == '__main__':
    main()
