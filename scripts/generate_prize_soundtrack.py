"""
KROOVA Prize Soundtrack Generator - ElevenLabs API
==================================================

Generates a cyberpunk soundtrack for the prize reveal animation.
Follows KROOVA branding: chaotic, urban, digitally distorted, cyberpunk organic.

Usage:
    1. Install: pip install elevenlabs python-dotenv
    2. Create .env file with: ELEVENLABS_API_KEY=your_key_here
    3. Run: python scripts/generate_prize_soundtrack.py

Outputs MP3 file to: frontend/public/sfx/prize_reveal_soundtrack.mp3
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from elevenlabs import ElevenLabs

# Load environment variables
load_dotenv()

# Initialize ElevenLabs client
client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY")
)

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "public" / "sfx"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Prize soundtrack configuration - KROOVA CYBERPUNK DNA
PRIZE_SOUNDTRACK = {
    "filename": "prize_reveal_soundtrack.mp3",
    "prompt": """Epic cyberpunk jackpot soundtrack. Starts with deep distorted sub-bass rumble building tension, glitched electronic pulses and neon synth arpeggios ascending. Dark urban atmosphere with digital crackle. Builds with 808 bass hits and cyber percussion. Climax with massive bass drop, triumphant braam with chaotic distortion. Iridescent synth cascade, victorious energy surge. Stylish, powerful, digitally corrupted.""",
    "duration": 8.0,  # Matches the prize animation duration
    "influence": 0.35  # Balanced between prompt and AI creativity
}

def generate_prize_soundtrack() -> bool:
    """Generate the prize reveal soundtrack"""
    
    config = PRIZE_SOUNDTRACK
    filename = config["filename"]
    prompt = config["prompt"].strip()
    duration = config["duration"]
    influence = config["influence"]
    
    output_path = OUTPUT_DIR / filename
    
    print("=" * 70)
    print("🎮 KROOVA Prize Soundtrack Generator")
    print("=" * 70)
    
    if not os.getenv("ELEVENLABS_API_KEY"):
        print("\n❌ ERROR: ELEVENLABS_API_KEY not found in environment")
        print("   Create a .env file with: ELEVENLABS_API_KEY=your_key_here")
        return False
    
    print(f"\n📁 Output directory: {OUTPUT_DIR}")
    print(f"\n🎵 Generating: {filename}")
    print(f"   Duration: {duration}s")
    print(f"   Influence: {influence}")
    print(f"\n🎨 Style: Cyberpunk organic, urban, digitally distorted")
    print(f"   Theme: Epic prize reveal with rising tension and bass drop")
    
    try:
        print(f"\n⏳ Calling ElevenLabs API...")
        
        # Generate audio
        audio_data = client.text_to_sound_effects.convert(
            text=prompt,
            duration_seconds=duration,
            prompt_influence=influence,
            output_format="mp3_44100_128"
        )
        
        print(f"✅ Audio generated, writing to file...")
        
        # Save to file
        with open(output_path, "wb") as f:
            # Audio data is a generator, iterate and write
            for chunk in audio_data:
                f.write(chunk)
        
        file_size = output_path.stat().st_size / 1024  # KB
        
        print(f"\n{'='*70}")
        print(f"✨ GENERATION COMPLETE")
        print(f"{'='*70}")
        print(f"✅ File: {output_path}")
        print(f"📊 Size: {file_size:.1f} KB")
        print(f"⏱️  Duration: {duration}s")
        print(f"\n🎉 Ready to use in booster animation!")
        print(f"\nNext steps:")
        print(f"  1. Test the audio file")
        print(f"  2. Add to cardAudio.ts if needed")
        print(f"  3. Integrate into prize reveal overlay")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    success = generate_prize_soundtrack()
    exit(0 if success else 1)
