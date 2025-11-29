import os
import requests
import json

# ElevenLabs API
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
if not ELEVENLABS_API_KEY:
    print(' ELEVENLABS_API_KEY não encontrada. Configure com:')
    print('="sua-chave-aqui"')
    exit(1)

# Voice ID para "The Philosopher" ou similar
# Se não tiver essa voz específica, use uma voz masculina cyberpunk
VOICE_ID = 'pNInz6obpgDQGcFmaJgB'  # Antoni (voz profunda masculina)

texts = [
    {
        'filename': 'onboarding_step1.mp3',
        'text': '''Algo está errado. Você acaba de despertar dentro da Interface, uma dimensão digital corrompida. Os vícios da humanidade ganharam consciência própria e se manifestam como Kroovas. Quanto mais profundo o vício, mais poderosa a manifestação. Você foi escolhido para caçá-las.''',
        'stability': 0.50,
        'similarity_boost': 0.75,
        'style': 0.70
    },
    {
        'filename': 'onboarding_step2.mp3',
        'text': '''Os vazamentos estão fora de controle. Cada pacote de cartas é um portal instável, uma rachadura entre dimensões. Dentro dele, você encontrará cinco Kroovas capturadas. Algumas são comuns, vícios menores. Outras são lendárias, obsessões que destroem vidas. No mercado negro da Interface, as mais raras valem fortunas.''',
        'stability': 0.50,
        'similarity_boost': 0.75,
        'style': 0.70
    },
    {
        'filename': 'onboarding_step3.mp3',
        'text': '''Agora, você é o comerciante de vícios. Abra pacotes de cartas, negocie no marketplace, recicle as fracas para invocar manifestações mais poderosas. Mas tenha cuidado. A Interface está viva, ela observa cada movimento e aprende com você. Quanto mais você joga, mais ela cresce. Seu primeiro pacote está esperando. Pronto para começar?''',
        'stability': 0.50,
        'similarity_boost': 0.75,
        'style': 0.70
    }
]

output_dir = 'frontend/public/audio/onboarding'
os.makedirs(output_dir, exist_ok=True)

print(' Gerando áudios do onboarding...\n')

for item in texts:
    print(f'Gerando: {item["filename"]}')
    print(f'Texto: {item["text"][:60]}...\n')
    
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}'
    
    headers = {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
    }
    
    data = {
        'text': item['text'],
        'model_id': 'eleven_multilingual_v2',  # Suporte a PT-BR
        'voice_settings': {
            'stability': item['stability'],
            'similarity_boost': item['similarity_boost'],
            'style': item.get('style', 0.5),
            'use_speaker_boost': True
        }
    }
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 200:
        output_path = os.path.join(output_dir, item['filename'])
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print(f' Salvo em: {output_path}\n')
    else:
        print(f' Erro {response.status_code}: {response.text}\n')

print(' Concluído!')
print(f'\n Áudios salvos em: {output_dir}')
