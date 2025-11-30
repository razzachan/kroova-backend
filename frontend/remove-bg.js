const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Lista de arquivos para processar
const files = [
  'icon_wallet_thumb.png',
  'icon_cards_thumb.png',
  'icon_marketplace_thumb.png',
  'icon_boosters_thumb.png',
  'logo_icon.png'
];

async function removeWhiteBackground(filename) {
  const inputPath = path.join(publicDir, filename);
  const outputFilename = filename.replace('.png', '_transparent.png');
  const outputPath = path.join(publicDir, outputFilename);

  try {
    console.log(`Processando ${filename}...`);
    
    await sharp(inputPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        // Remove pixels brancos/cinzas de forma mais agressiva
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Se o pixel é branco/cinza claro (mais agressivo)
          if (r > 150 && g > 150 && b > 150) {
            data[i + 3] = 0; // Alpha = 0 (transparente)
          }
          // Se o pixel é cinza médio, reduz bastante a opacidade
          else if (r > 100 && g > 100 && b > 100) {
            data[i + 3] = Math.floor(data[i + 3] * 0.2);
          }
          // Se o pixel é cinza escuro, reduz um pouco
          else if (r > 70 && g > 70 && b > 70) {
            data[i + 3] = Math.floor(data[i + 3] * 0.5);
          }
        }
        
        return sharp(data, {
          raw: {
            width: info.width,
            height: info.height,
            channels: 4
          }
        })
        .png()
        .toFile(outputPath);
      });
    
    console.log(`✅ ${outputFilename} criado com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro ao processar ${filename}:`, error.message);
  }
}

async function processAll() {
  console.log('🔧 Removendo fundos brancos das imagens...\n');
  
  for (const file of files) {
    await removeWhiteBackground(file);
  }
  
  console.log('\n✅ Processamento concluído!');
  console.log('Os arquivos *_transparent.png foram criados no diretório public/');
}

processAll();
