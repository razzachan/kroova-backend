#!/usr/bin/env python3
"""
KROOVA Mystery Box Sound Effects Generator - ElevenLabs API
===========================================================

Generates cinematic sound effects for Mystery Box system using ElevenLabs.

Sound Effects:
1. Spinning sound - mechanical rotation with suspense
2. Lose sound - disappointing but not harsh
3. Medium win sound - satisfying victory
4. Jackpot sound - EPIC celebration

Usage:
    1. Install: pip install elevenlabs python-dotenv
    2. Ensure .env has: ELEVENLABS_API_KEY=your_key_here
    3. Run: python scripts/generate-mystery-box-sounds.py --all
    4. Or: python scripts/generate-mystery-box-sounds.py --sound spinning

Outputs MP3 files to: frontend/public/sfx/mystery-box/
"""

import os
import sys
import argparse
from pathlib import Path
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')

if not ELEVENLABS_API_KEY:
    print("❌ ELEVENLABS_API_KEY not found in environment")
    sys.exit(1)

try:
    from elevenlabs import ElevenLabs
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    print("   Install with: pip install elevenlabs")
    sys.exit(1)

# Initialize ElevenLabs client
client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "public" / "sfx" / "mystery-box"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Mystery Box Sound Effects Definitions
MYSTERY_BOX_SOUNDS = {
    'spinning': {
        'filename': 'mystery-box-spinning.mp3',
        'prompt': '''CATASTROPHIC industrial slot machine with EARTHQUAKE sub-bass rumble, DEAFENING metallic grinding with sparks flying, 
        EXPLOSIVE rapid fire clicks building to absolute CHAOS, distorted digital alarm SCREAMING upward in pitch, 
        heavy machinery ROARING with cyber glitch EXPLOSIONS, CRUSHING bass drops with metallic CARNAGE''',
        'duration': 5.0,
        'influence': 0.2,
        'description': 'Spinning animation sound (loop during opening)'
    },
    
    'lose': {
        'filename': 'mystery-box-lose.mp3',
        'prompt': '''DEVASTATING game show fail buzzer with CATHEDRAL reverb, APOCALYPTIC descending BWAAAH with maximum distortion, 
        THUNDEROUS sub-bass rumble fading into darkness, electric shock ZAP with EXPLOSIVE digital crash, 
        POWERFUL metallic CLANG echoing through eternity, cinematic TRAGEDY with orchestral WEIGHT''',
        'duration': 3.5,
        'influence': 0.25,
        'description': 'Loss result (90% of cases) - R$ 0.10-2.00 lost'
    },
    
    'medium_win': {
        'filename': 'mystery-box-medium-win.mp3',
        'prompt': '''EXPLOSIVE ascending synth arpeggio with BASS CANNON foundation, DEAFENING cyber bells with MASSIVE cathedral reverb, 
        THUNDEROUS coin cascade with METALLIC CARNAGE, triumphant brass FANFARE with EARTHQUAKE sub-bass, 
        celebratory cha-ching with DISTORTED 808 SLAM, neon fireworks EXPLOSION with crowd ROAR''',
        'duration': 4.5,
        'influence': 0.2,
        'description': 'Medium win (9% chance) - 3x multiplier (R$ 1.50-30.00)'
    },
    
    'jackpot': {
        'filename': 'mystery-box-jackpot.mp3',
        'prompt': '''WORLD-ENDING jackpot with APOCALYPTIC orchestral hit and TECTONIC sub-bass EARTHQUAKE, 
        NUCLEAR brass fanfare with DEMOLISHED synth layers, CATACLYSMIC coin TSUNAMI with metallic CHAOS, 
        ANNIHILATING 808 bass CANNON drops, confetti NUCLEAR EXPLOSION, air horn ASSAULT, 
        stadium crowd ERUPTION with MAXIMUM HYPE INFINITY ENERGY''',
        'duration': 7.0,
        'influence': 0.15,
        'description': 'JACKPOT win (1% chance) - 30x multiplier (R$ 15-300)'
    },
    
    'purchase': {
        'filename': 'mystery-box-purchase.mp3',
        'prompt': '''DEVASTATING cash register SLAM with HEAVY metallic IMPACT and bass EARTHQUAKE, 
        THUNDEROUS confirmation beep with sub-bass PUNCH, crisp ka-ching with CATHEDRAL distorted reverb, 
        authoritative POWERFUL transaction with WEIGHT and AUTHORITY, IMPACTFUL purchase''',
        'duration': 2.0,
        'influence': 0.3,
        'description': 'Purchase confirmation (buying a Mystery Box)'
    },
    
    'reveal_buildup': {
        'filename': 'mystery-box-reveal-buildup.mp3',
        'prompt': '''CATASTROPHIC tension riser with POUNDING heartbeat bass drum EARTHQUAKE, 
        CRUSHING synth riser with AGGRESSIVE distortion and SCREAMING pitch, MANIC slot machine clicking going BERSERK, 
        orchestral strings CRESCENDO with TECTONIC rumble, emergency alarm SCREAMING, MAXIMUM suspense''',
        'duration': 5.0,
        'influence': 0.18,
        'description': 'Build tension before revealing prize'
    }
}


def generate_sound_effect(sound_key, output_dir):
    """
    Generate a single Mystery Box sound effect using ElevenLabs API
    """
    sound = MYSTERY_BOX_SOUNDS[sound_key]
    output_path = output_dir / sound['filename']
    
    print(f"\n{'='*60}")
    print(f"🔊 Generating: {sound['filename']}")
    print(f"📝 Type: {sound['description']}")
    print(f"⏱️  Duration: {sound['duration']}s")
    print(f"🎚️  Influence: {sound['influence']}")
    print(f"{'='*60}")
    print(f"Prompt: {sound['prompt'][:100]}...")
    
    try:
        # Generate sound effect using ElevenLabs Sound Generation API
        audio_generator = client.text_to_sound_effects.convert(
            text=sound['prompt'],
            duration_seconds=sound['duration'],
            prompt_influence=sound['influence']
        )
        
        # Write audio to file
        with open(output_path, 'wb') as f:
            for chunk in audio_generator:
                f.write(chunk)
        
        # Get file size
        file_size = output_path.stat().st_size / 1024  # KB
        
        print(f"✅ SUCCESS: {output_path.name}")
        print(f"   Size: {file_size:.1f} KB")
        print(f"   Path: {output_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR generating {sound['filename']}: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Generate Mystery Box sound effects using ElevenLabs',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  Generate all sounds:
    python generate-mystery-box-sounds.py --all --delay 2
    
  Generate specific sound:
    python generate-mystery-box-sounds.py --sound jackpot
    
  Generate multiple specific sounds:
    python generate-mystery-box-sounds.py --sound spinning lose medium_win
        '''
    )
    
    parser.add_argument(
        '--all',
        action='store_true',
        help='Generate all Mystery Box sound effects'
    )
    
    parser.add_argument(
        '--sound',
        nargs='+',
        choices=list(MYSTERY_BOX_SOUNDS.keys()),
        help='Generate specific sound effect(s)'
    )
    
    parser.add_argument(
        '--output',
        type=Path,
        default=OUTPUT_DIR,
        help=f'Output directory (default: {OUTPUT_DIR})'
    )
    
    parser.add_argument(
        '--delay',
        type=float,
        default=3.0,
        help='Delay in seconds between API calls (default: 3.0)'
    )
    
    parser.add_argument(
        '--list',
        action='store_true',
        help='List all available sound effects'
    )
    
    args = parser.parse_args()
    
    # List sounds and exit
    if args.list:
        print("\n🔊 MYSTERY BOX SOUND EFFECTS")
        print("="*60)
        for key, sound in MYSTERY_BOX_SOUNDS.items():
            print(f"\n{key}:")
            print(f"  File: {sound['filename']}")
            print(f"  Description: {sound['description']}")
            print(f"  Duration: {sound['duration']}s")
        return
    
    # Validate arguments
    if not args.all and not args.sound:
        parser.print_help()
        print("\n❌ Error: Must specify --all or --sound <name>")
        sys.exit(1)
    
    # Create output directory
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Determine which sounds to generate
    if args.all:
        sounds_to_generate = list(MYSTERY_BOX_SOUNDS.keys())
    else:
        sounds_to_generate = args.sound
    
    # Generate sounds
    print(f"\n🎵 MYSTERY BOX SOUND GENERATION")
    print(f"📁 Output: {output_dir}")
    print(f"🔢 Total sounds: {len(sounds_to_generate)}")
    print(f"⏱️  Delay: {args.delay}s between calls")
    
    results = {'success': [], 'failed': []}
    
    for i, sound_key in enumerate(sounds_to_generate):
        # Add delay between requests (except first one)
        if i > 0:
            print(f"\n⏳ Waiting {args.delay}s before next generation...")
            time.sleep(args.delay)
        
        success = generate_sound_effect(sound_key, output_dir)
        
        if success:
            results['success'].append(sound_key)
        else:
            results['failed'].append(sound_key)
    
    # Summary
    print(f"\n{'='*60}")
    print(f"📊 GENERATION SUMMARY")
    print(f"{'='*60}")
    print(f"✅ Successful: {len(results['success'])}/{len(sounds_to_generate)}")
    if results['success']:
        for sound in results['success']:
            print(f"   - {MYSTERY_BOX_SOUNDS[sound]['filename']}")
    
    if results['failed']:
        print(f"\n❌ Failed: {len(results['failed'])}")
        for sound in results['failed']:
            print(f"   - {MYSTERY_BOX_SOUNDS[sound]['filename']}")
    
    print(f"\n📁 Output directory: {output_dir}")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()
