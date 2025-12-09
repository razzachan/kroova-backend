#!/usr/bin/env python3
"""
KROOVA Jackpot Animation Generator
Generates cinematic video using Google Veo 3

Usage:
    python scripts/generate_jackpot_animation.py

Output:
    frontend/public/animations/jackpot-prize.mp4
"""

import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Vertex AI configuration
PROJECT_ID = os.getenv('GOOGLE_CLOUD_PROJECT', 'gen-lang-client-0056297016')
LOCATION = os.getenv('GOOGLE_CLOUD_LOCATION', 'us-central1')

try:
    from google import genai
    from google.genai import types
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    print("   Install with: pip install google-genai python-dotenv")
    sys.exit(1)

# ====== ANIMATION CONFIGURATION ======
ANIMATION_CONFIG = {
    'name': 'Kroova Jackpot Prize Reveal',
    'duration': 4,  # seconds (will loop in frontend)
    'prompt': """
A cinematic 4-second looping animation of a cyberpunk jackpot prize reveal.

SETTING: Dark void background with subtle neon grid pattern fading into distance, 
deep black with slight purple haze.

MAIN ELEMENTS:
- Three large translucent hexagonal tokens spinning upward in formation
- First hexagon: Bright neon green (#00ff41) with internal circuit patterns
- Second hexagon: Electric cyan (#00d9ff) with pulsing glow
- Third hexagon: Vibrant purple (#b026ff) with shimmer effect
- Each hexagon rotates on multiple axes while ascending

PARTICLE EFFECTS:
- Small square digital pixels exploding outward in all directions
- Green, cyan, and purple pixel bursts synchronized with hexagon spins
- Particles fade and dissolve into scan lines

VISUAL EFFECTS:
- Vertical neon scan lines sweeping across like Matrix code rain
- Chromatic aberration on hexagon edges (RGB split)
- Volumetric god rays breaking through the darkness
- Lens flares from bright hexagon centers
- Glitch effects: brief horizontal tears and pixel distortion

MOTION:
- Smooth upward camera movement following the hexagons
- Hexagons spiral rotation (60 rpm)
- Particle explosions timed to beat (120 BPM feel)
- Seamless loop: hexagons exit top as new ones enter bottom

STYLE:
- AAA game trailer cinematography
- Blade Runner / Cyberpunk 2077 aesthetic
- Photorealistic volumetric lighting and fog
- High contrast with deep blacks
- 60fps smooth motion
- Film grain overlay for texture
- Color grading: cool tones with neon accents

CAMERA:
- Medium shot framing
- Slight depth of field (bokeh on background)
- Subtle chromatic aberration on edges
- Lens distortion for cinematic feel
""",
}

# Output paths
OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "public" / "animations"
OUTPUT_FILE = OUTPUT_DIR / "jackpot-prize.mp4"


class JackpotAnimationGenerator:
    """Generates jackpot prize animation video using Veo 3"""
    
    def __init__(self):
        """Initialize the generator with Vertex AI"""
        
        print(f"🔧 Initializing Vertex AI")
        print(f"   Project: {PROJECT_ID}")
        print(f"   Location: {LOCATION}")
        
        # Authenticate with Vertex AI (uses ADC from gcloud)
        self.client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)
        
        # Model identifier for Veo 3
        self.model_name = "veo-3.1-generate-001"
        print(f"✅ Using model: {self.model_name}")
    
    def generate_video(self) -> bytes:
        """
        Generate the jackpot animation video
        
        Returns:
            bytes: MP4 video content
        """
        print("\n🎰 Generating Kroova jackpot animation...")
        print(f"📝 Prompt length: {len(ANIMATION_CONFIG['prompt'])} characters")
        print(f"⏱️  Duration: {ANIMATION_CONFIG['duration']} seconds")
        
        try:
            # Generate video with Veo 3
            print("\n🚀 Starting video generation...")
            
            operation = self.client.models.generate_videos(
                model=self.model_name,
                prompt=ANIMATION_CONFIG['prompt'],
                config=types.GenerateVideosConfig(
                    aspect_ratio="16:9",  # Veo 3 supports 16:9 or 9:16
                    number_of_videos=1,
                    duration_seconds=ANIMATION_CONFIG['duration'],
                    resolution="720p",
                    person_generation="dont_allow",
                    enhance_prompt=True,
                    generate_audio=False,
                ),
            )
            
            # Wait for generation to complete
            print("⏳ Generating video (this may take 2-5 minutes)...", end="", flush=True)
            dots = 0
            while not operation.done:
                time.sleep(15)
                operation = self.client.operations.get(operation)
                print(".", end="", flush=True)
                dots += 1
                if dots % 4 == 0:
                    print(f" {dots * 15}s", end="", flush=True)
            
            print("\n✅ Video generation complete!")
            
            # Extract video bytes from response
            if not operation.result or not operation.result.generated_videos:
                raise ValueError("No video generated in response")
            
            video_bytes = operation.result.generated_videos[0].video.video_bytes
            print(f"📦 Video size: {len(video_bytes) / 1024:.1f} KB")
            
            return video_bytes
            
        except Exception as e:
            print(f"\n❌ Video generation failed: {e}")
            if hasattr(e, 'details'):
                print(f"   Details: {e.details}")
            raise
    
    def save_video(self, video_bytes: bytes):
        """Save video to output file"""
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        
        print(f"\n💾 Saving to: {OUTPUT_FILE}")
        OUTPUT_FILE.write_bytes(video_bytes)
        print(f"✅ Saved {len(video_bytes) / 1024:.1f} KB")


def main():
    """Main execution"""
    print("=" * 60)
    print("KROOVA JACKPOT ANIMATION GENERATOR")
    print("=" * 60)
    
    try:
        # Initialize generator
        generator = JackpotAnimationGenerator()
        
        # Generate video
        video_bytes = generator.generate_video()
        
        # Save to file
        generator.save_video(video_bytes)
        
        print("\n" + "=" * 60)
        print("✅ SUCCESS!")
        print("=" * 60)
        print(f"\n🎬 Video saved to: {OUTPUT_FILE}")
        print("\n📋 Next steps:")
        print("   1. Review the generated video")
        print("   2. Update frontend to use <video> instead of Lottie")
        print("   3. Deploy to production")
        print("\n🚀 Video is ready for integration!")
        
    except Exception as e:
        print(f"\n❌ Failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
