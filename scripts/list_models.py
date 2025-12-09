#!/usr/bin/env python3
"""List available Google Gen AI models"""

import os
from dotenv import load_dotenv

load_dotenv()

from google import genai

client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))

print("\nAvailable Models:\n")
for model in client.models.list():
    print(f"  - {model.name}")
    if hasattr(model, 'supported_generation_methods'):
        print(f"    Methods: {', '.join(model.supported_generation_methods)}")
    print()
