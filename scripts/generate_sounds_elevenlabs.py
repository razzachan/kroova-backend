"""
KROOVA Sound Effects Generator - ElevenLabs API
================================================

Generates cinematic sound effects for the card game using ElevenLabs API.

Usage:
    1. Install: pip install elevenlabs python-dotenv
    2. Create .env file with: ELEVENLABS_API_KEY=your_key_here
    3. Run: python scripts/generate_sounds_elevenlabs.py

Outputs MP3 files to: frontend/public/sfx/
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from elevenlabs import ElevenLabs
import json

# Load environment variables
load_dotenv()

# Initialize ElevenLabs client
client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY")
)

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "public" / "sfx"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Sound effects definitions - KROOVA CYBERPUNK URBAN DNA
SOUND_EFFECTS = {
    # Pack opening sounds
    "explosions": [
        {
            "filename": "pack_explosion_epic.mp3",
            "prompt": "Digital booster pack explosion with electronic glitch burst, cyber impact with distorted bass drop, synthetic glass shattering with neon energy surge, urban futuristic whoosh",
            "duration": 2.5,
            "influence": 0.4
        },
        {
            "filename": "pack_open_cloth.mp3",
            "prompt": "Tech fabric tearing with digital crackle, quick synthetic snap with subtle electronic buzz, cyberpunk package opening",
            "duration": 0.8,
            "influence": 0.5
        }
    ],
    
    # Card reveal sounds
    "reveals": [
        {
            "filename": "legendary_reveal.mp3",
            "prompt": "Epic legendary card reveal with massive synth stab, cyber bass drop with distorted 808 hit, neon energy surge with digital cascade, powerful electronic impact, triumphant cyberpunk braam",
            "duration": 3.0,
            "influence": 0.3
        },
        {
            "filename": "godmode_reveal.mp3",
            "prompt": "Ultimate godmode reveal with devastating bass cannon drop, cyberpunk braam with glitched synth layers, electronic thunder with distorted sub-bass rumble, world-breaking digital impact, chaotic energy surge",
            "duration": 3.5,
            "influence": 0.3
        },
        {
            "filename": "rare_reveal.mp3",
            "prompt": "Cyber rare card reveal with glitched electronic chime, synthetic energy pulse with neon shimmer, digital distortion cascade, futuristic and edgy",
            "duration": 1.5,
            "influence": 0.4
        }
    ],
    
    # Ambient sounds (adaptive layers)
    "ambient": [
        {
            "filename": "menu_idle.mp3",
            "prompt": "Minimal cyberpunk ambient drone, ultra subtle synth pad with low-pass filter, barely perceptible technological hum, deep atmospheric presence, very quiet and unobtrusive, seamless loop",
            "duration": 30.0,
            "influence": 0.15,
            "loop": True
        },
        {
            "filename": "store_active.mp3",
            "prompt": "Dark cyberpunk urban ambience with moderate synth pad, electronic drone with digital glitches, neon city atmosphere with technological hum, dystopian vibe, seamless loop",
            "duration": 30.0,
            "influence": 0.2,
            "loop": True
        },
        {
            "filename": "pre_reveal_tension.mp3",
            "prompt": "Intense cyber tension with heavy sub-bass pulsing, dark synth drone with rhythmic glitch hits, ominous digital atmosphere building suspense, distorted bass rumble, high energy technological unease, seamless loop",
            "duration": 30.0,
            "influence": 0.25,
            "loop": True
        },
        {
            "filename": "tension_ambience.mp3",
            "prompt": "Suspenseful cyber tension with dark synth drone, glitched pulses, low distorted bass rumble, ominous digital atmosphere, technological unease, perfect for card selection, seamless loop",
            "duration": 30.0,
            "influence": 0.2,
            "loop": True
        }
    ],
    
    # UI sounds (will be procedural, but backup versions)
    "ui": [
        {
            "filename": "card_flip.mp3",
            "prompt": "Quick card flip sound, sharp snap with subtle whoosh, like flipping a playing card",
            "duration": 0.3,
            "influence": 0.6
        },
        {
            "filename": "card_hover.mp3",
            "prompt": "Subtle magical shimmer sound, soft and quick, like touching a magical object",
            "duration": 0.2,
            "influence": 0.5
        }
    ]
}

def generate_sound(category: str, sound_config: dict) -> bool:
    """Generate a single sound effect"""
    
    filename = sound_config["filename"]
    prompt = sound_config["prompt"]
    duration = sound_config.get("duration")
    influence = sound_config.get("influence", 0.3)
    loop = sound_config.get("loop", False)
    
    output_path = OUTPUT_DIR / category / filename
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"\n🎵 Generating: {category}/{filename}")
    print(f"   Prompt: {prompt[:60]}...")
    print(f"   Duration: {duration}s | Influence: {influence} | Loop: {loop}")
    
    try:
        # Generate audio
        audio_data = client.text_to_sound_effects.convert(
            text=prompt,
            duration_seconds=duration,
            prompt_influence=influence,
            output_format="mp3_44100_128"
        )
        
        # Save to file
        with open(output_path, "wb") as f:
            # Audio data is a generator, iterate and write
            for chunk in audio_data:
                f.write(chunk)
        
        print(f"   ✅ Saved: {output_path}")
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def generate_all_sounds():
    """Generate all sound effects"""
    
    print("=" * 70)
    print("🎮 KROOVA Sound Effects Generator - ElevenLabs API")
    print("=" * 70)
    
    if not os.getenv("ELEVENLABS_API_KEY"):
        print("\n❌ ERROR: ELEVENLABS_API_KEY not found in environment")
        print("   Create a .env file with: ELEVENLABS_API_KEY=your_key_here")
        return
    
    print(f"\n📁 Output directory: {OUTPUT_DIR}")
    
    # Stats
    total_sounds = sum(len(sounds) for sounds in SOUND_EFFECTS.values())
    successful = 0
    failed = 0
    
    # Generate each category
    for category, sounds in SOUND_EFFECTS.items():
        print(f"\n{'='*70}")
        print(f"📂 Category: {category.upper()}")
        print(f"{'='*70}")
        
        for sound_config in sounds:
            if generate_sound(category, sound_config):
                successful += 1
            else:
                failed += 1
    
    # Summary
    print(f"\n{'='*70}")
    print(f"✨ GENERATION COMPLETE")
    print(f"{'='*70}")
    print(f"✅ Successful: {successful}/{total_sounds}")
    if failed > 0:
        print(f"❌ Failed: {failed}/{total_sounds}")
    print(f"\n📁 Files saved to: {OUTPUT_DIR}")
    
    # Create manifest file
    manifest = {
        "generated_at": "2025-11-28",
        "total_sounds": total_sounds,
        "categories": {
            category: [s["filename"] for s in sounds]
            for category, sounds in SOUND_EFFECTS.items()
        }
    }
    
    manifest_path = OUTPUT_DIR / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    
    print(f"📄 Manifest: {manifest_path}")
    print("\n🎉 Ready to use in cardAudio.ts!")

if __name__ == "__main__":
    generate_all_sounds()
