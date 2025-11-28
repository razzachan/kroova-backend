#!/usr/bin/env python3
"""
Upload card images to Supabase Storage and create bucket if needed
Automatically compresses images >5MB to fit Supabase limits
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import requests
from PIL import Image
import io

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
BUCKET_NAME = 'card-images'
MAX_SIZE_MB = 4.5  # Keep under 5MB with margin

def create_bucket_if_needed():
    """Create public bucket for card images"""
    url = f"{SUPABASE_URL}/storage/v1/bucket"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
    }
    
    # Check if bucket exists
    list_url = f"{SUPABASE_URL}/storage/v1/bucket"
    res = requests.get(list_url, headers=headers)
    
    if res.ok:
        buckets = res.json()
        if any(b['name'] == BUCKET_NAME for b in buckets):
            print(f"✅ Bucket '{BUCKET_NAME}' already exists")
            return True
    
    # Create bucket
    payload = {
        'id': BUCKET_NAME,
        'name': BUCKET_NAME,
        'public': True,
        'file_size_limit': 5242880,  # 5MB
        'allowed_mime_types': ['image/png', 'image/jpeg']
    }
    
    res = requests.post(url, headers=headers, json=payload)
    
    if res.ok or res.status_code == 409:  # 409 = already exists
        print(f"✅ Bucket '{BUCKET_NAME}' created successfully")
        return True
    else:
        print(f"❌ Failed to create bucket: {res.status_code} {res.text}")
        return False


def compress_image_if_needed(file_path: Path) -> bytes:
    """Compress image to PNG if file size > MAX_SIZE_MB"""
    file_size_mb = file_path.stat().st_size / (1024 * 1024)
    
    if file_size_mb <= MAX_SIZE_MB:
        # Small enough, return as-is
        with open(file_path, 'rb') as f:
            return f.read()
    
    # Too large, compress
    print(f"  🔧 Compressing {file_path.name} ({file_size_mb:.2f}MB → ", end='')
    
    img = Image.open(file_path)
    
    # For very large images, resize first
    if file_size_mb > 7:
        width, height = img.size
        new_size = (int(width * 0.7), int(height * 0.7))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        print(f"resize 70% → ", end='')
    
    # Try progressively lower quality until under limit
    for quality in [95, 90, 85, 80, 75, 70, 65]:
        buffer = io.BytesIO()
        img.save(buffer, format='PNG', optimize=True, compress_level=9)
        compressed_size_mb = buffer.tell() / (1024 * 1024)
        
        if compressed_size_mb <= MAX_SIZE_MB:
            print(f"{compressed_size_mb:.2f}MB)")
            return buffer.getvalue()
    
    # Last resort: aggressive resize
    print("aggressive resize → ", end='')
    width, height = img.size
    new_size = (int(width * 0.6), int(height * 0.6))
    img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG', optimize=True, compress_level=9)
    final_size_mb = buffer.tell() / (1024 * 1024)
    print(f"{final_size_mb:.2f}MB)")
    
    return buffer.getvalue()


def upload_image(file_path: Path) -> str:
    """Upload single image to Supabase Storage"""
    display_id = file_path.stem  # crd_xxxxx
    
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{display_id}.png"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'image/png',
        'x-upsert': 'true',  # Overwrite if exists
    }
    
    image_data = compress_image_if_needed(file_path)
    res = requests.post(url, headers=headers, data=image_data)
    
    if res.ok:
        # Return public URL
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{display_id}.png"
        return public_url
    else:
        raise Exception(f"{res.status_code}: {res.text}")


def main():
    print("🚀 Supabase Storage Upload - Card Images")
    print("=" * 70)
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Missing Supabase credentials in .env")
        sys.exit(1)
    
    # Create bucket if needed
    if not create_bucket_if_needed():
        sys.exit(1)
    
    # Find images
    images_dir = Path(__file__).parent / 'public' / 'cards'
    
    if not images_dir.exists():
        print(f"❌ Directory not found: {images_dir}")
        sys.exit(1)
    
    image_files = list(images_dir.glob('*.png'))
    
    if not image_files:
        print(f"❌ No PNG files found in {images_dir}")
        sys.exit(1)
    
    print(f"\n📁 Found {len(image_files)} images in {images_dir}")
    print(f"🌐 Target: {SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/")
    print("")
    
    uploaded = 0
    failed = 0
    
    for img_path in sorted(image_files):
        try:
            public_url = upload_image(img_path)
            print(f"✅ {img_path.name} → {public_url}")
            uploaded += 1
        except Exception as e:
            print(f"❌ {img_path.name}: {e}")
            failed += 1
    
    print("\n" + "=" * 70)
    print(f"✅ Uploaded: {uploaded}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Total: {len(image_files)}")
    
    if uploaded > 0:
        print("\n✅ Images are now public at:")
        print(f"   {SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{{display_id}}.png")
        print("\n🔄 Next step: Update image_url in database with:")
        print(f"   python scripts/update-image-urls-db.py")


if __name__ == '__main__':
    main()
