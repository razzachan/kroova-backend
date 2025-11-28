# 🎨 Plano de Deploy - Card Images Kroova

## 📊 Status Atual

### ✅ O que já temos:
- **251 cartas** no banco (Supabase `cards_base`)
- **45 imagens geradas** em `scripts/public/cards/` (cards 36-63)
- **Campo `image_url`** atualizado no banco com `/cards/{display_id}.png`
- **Frontend** já consome `card.image_url` via API

### ❌ O que falta:
- **Hospedar as imagens** (atualmente só local)
- **Frontend exibir as imagens** (atualmente mostra 🎴 placeholder)
- **Gerar as 206 imagens restantes**

---

## 🎯 Opções de Deploy

### **Opção 1: Supabase Storage (RECOMENDADO)** 🏆

**Prós:**
- ✅ Já temos Supabase configurado
- ✅ CDN global automático
- ✅ Integração nativa com RLS
- ✅ Grátis até 1GB (suficiente para 251 PNGs)
- ✅ URL pública automática

**Processo:**
1. Upload das imagens para bucket `card-images` no Supabase Storage
2. Atualizar `image_url` no banco com URLs públicas do Supabase
3. Frontend já vai puxar automaticamente

**Comandos:**
```bash
# 1. Criar bucket via Supabase Dashboard ou SQL
# 2. Upload via script Python
python scripts/upload-images-to-supabase.py

# 3. Atualizar URLs no banco
UPDATE cards_base 
SET image_url = 'https://[project].supabase.co/storage/v1/object/public/card-images/' || display_id || '.png'
WHERE image_url LIKE '/cards/%';
```

---

### **Opção 2: Vercel Blob Storage**

**Prós:**
- ✅ Integra com deploy Vercel do frontend
- ✅ CDN global

**Contras:**
- ❌ Custo maior (pago após primeiros GB)
- ❌ Requer configuração extra

---

### **Opção 3: AWS S3 + CloudFront**

**Prós:**
- ✅ Mais controle e performance
- ✅ Barato em escala

**Contras:**
- ❌ Complexidade de setup (IAM, bucket policies, CloudFront)
- ❌ Custo inicial de configuração

---

## 🚀 Plano Recomendado (Supabase Storage)

### **Fase 1: Setup do Storage (10 min)**
1. Criar bucket `card-images` no Supabase (público)
2. Configurar políticas RLS para leitura pública

### **Fase 2: Script de Upload (30 min)**
Criar `scripts/upload-images-to-supabase.py`:
```python
import os
from supabase import create_client
from pathlib import Path

# Upload todas as imagens de scripts/public/cards/
# Retorna lista de URLs públicas
```

### **Fase 3: Atualizar DB (5 min)**
```sql
UPDATE cards_base 
SET image_url = 'https://[project-ref].supabase.co/storage/v1/object/public/card-images/' || display_id || '.png'
WHERE display_id IN (SELECT display_id FROM cards_base WHERE image_url LIKE '/cards/%');
```

### **Fase 4: Frontend Display (15 min)**
Atualizar `frontend/app/boosters/page.tsx` linha ~195:
```tsx
<div className="aspect-[2/3] bg-gray-700 rounded mb-2 overflow-hidden">
  {card.card.image_url ? (
    <img 
      src={card.card.image_url} 
      alt={card.card.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-4xl">🎴</span>
  )}
</div>
```

### **Fase 5: Gerar Imagens Restantes (2-4 dias)**
```bash
# Continuar geração com ultra (30/dia) + fallback fast/generate
python scripts/generate-card-images-gemini.py --resume --yes --fallback-models fast,generate
```

---

## 📋 Checklist de Execução

- [ ] **Criar bucket** `card-images` no Supabase Storage
- [ ] **Configurar políticas** de leitura pública
- [ ] **Criar script** `upload-images-to-supabase.py`
- [ ] **Upload** das 45 imagens já geradas
- [ ] **Atualizar** `image_url` no banco para URLs Supabase
- [ ] **Testar** frontend exibindo imagens
- [ ] **Deploy frontend** (Vercel)
- [ ] **Gerar** 206 imagens restantes (batches diários)
- [ ] **Upload** incremental conforme novas imagens ficam prontas

---

## 🔧 Script de Upload - Supabase

Criar arquivo `scripts/upload-images-to-supabase.py`:

```python
#!/usr/bin/env python3
"""
Upload card images to Supabase Storage
"""
import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
BUCKET_NAME = 'card-images'

def main():
    client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Path local das imagens
    images_dir = Path(__file__).parent / 'public' / 'cards'
    
    print(f"📁 Scanning {images_dir}")
    
    uploaded = 0
    failed = 0
    
    for image_path in images_dir.glob('*.png'):
        display_id = image_path.stem  # crd_xxxxx
        
        try:
            with open(image_path, 'rb') as f:
                # Upload to Supabase Storage
                res = client.storage.from_(BUCKET_NAME).upload(
                    path=f"{display_id}.png",
                    file=f,
                    file_options={"content-type": "image/png"}
                )
                
            print(f"✅ {display_id}.png")
            uploaded += 1
            
        except Exception as e:
            print(f"❌ {display_id}.png: {e}")
            failed += 1
    
    print(f"\n✅ Uploaded: {uploaded}")
    print(f"❌ Failed: {failed}")

if __name__ == '__main__':
    main()
```

---

## 🌐 Atualização do Frontend

O frontend já está preparado! Só precisa das URLs públicas no banco.

**Arquivo:** `frontend/app/boosters/page.tsx`  
**Linha 195:** Já consome `card.card.image_url`

Quando o `image_url` estiver apontando para Supabase Storage, o frontend vai exibir automaticamente.

---

## 💰 Custo Estimado

### Supabase Storage (Plano Free)
- **1GB grátis** (suficiente para ~4000 imagens 2K PNG)
- **Bandwidth:** 2GB/mês grátis
- **CDN:** Incluído

### Vercel (Deploy Frontend)
- **Hobby:** Grátis (suficiente)
- **Pro:** $20/mês (se precisar mais recursos)

**Total estimado:** $0 - $20/mês

---

## 🎯 Próximos Passos Imediatos

1. **Eu crio** o script de upload para Supabase
2. **Você decide:** usar Supabase Storage ou outra opção?
3. **Criamos** o bucket no Supabase
4. **Upload** das 45 imagens já prontas
5. **Testar** no frontend
6. **Deploy** frontend na Vercel
7. **Continuar** geração das 206 imagens restantes em batches diários
