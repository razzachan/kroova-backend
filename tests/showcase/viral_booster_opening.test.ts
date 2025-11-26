import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app.js';
import { randomUUID } from 'crypto';

// Conceitos de cartas pensados para impacto visual e narrativa curta (vídeo shorts)
// Cada uma inclui: nome, rarity alvo, hook (frase curta), descrição expandida e prompt de imagem.
// O teste associa até 5 cartas abertas às ideias abaixo pela raridade.
const VIRAL_CONCEPTS: Record<string, Array<{
  name: string;
  hook: string;
  description: string;
  imagePrompt: string;
}>> = {
  trash: [
    {
      name: 'Bug Fantasma 404',
      hook: 'O erro que caça usuários',
      description: 'Uma carta comum que representa falhas sutis: aparece e desaparece causando micro travamentos. Serve como metáfora do caos silencioso da internet.',
      imagePrompt: 'glitchy translucent ghost made of 404 code fragments, pixel noise aura, teal and magenta cyberpunk palette'
    }
  ],
  meme: [
    {
      name: 'Gato Buffering Infinito',
      hook: 'O loop eterno virou aliado',
      description: 'Um meme vivo: o gato loading gira para sempre e canaliza a impaciência coletiva da rede em vantagem estratégica.',
      imagePrompt: 'looping cat spinner icon hybrid, holographic fur, vibrant neon ring, playful cyber aesthetic'
    }
  ],
  viral: [
    {
      name: 'Explosão de Latência Zero',
      hook: 'Quando tudo responde instantaneamente',
      description: 'Carta que zera a latência por alguns segundos, criando momentos dramaticamente acelerados e potencial para combos espetaculares em vídeo.',
      imagePrompt: 'energy vortex collapsing into a sharp crystal core, motion blur streaks, pure white and electric blue'
    }
  ],
  legendary: [
    {
      name: 'Oráculo do Algoritmo Oculto',
      hook: 'Prevendo a tendência antes de nascer',
      description: 'Lenda que antecipa o próximo pico de engajamento; visual enigmático que mistura circuito neural e pergaminhos arcânicos.',
      imagePrompt: 'ancient oracle fused with neural network circuitry, glowing sigils, deep indigo and gold accent lighting'
    }
  ],
  godmode: [
    {
      name: 'Kernel Primordial',
      hook: 'Reescreve as regras em tempo real',
      description: 'Entidade máxima: injeta patch divino no sistema, mudando probabilidades ao vivo. Perfeita para clímax de vídeo com reação exagerada.',
      imagePrompt: 'cosmic core kernel sphere, fractal runes orbiting, radiant white-gold light rays, cinematic volumetric glow'
    }
  ]
};

function pickConcept(rarity: string) {
  const list = VIRAL_CONCEPTS[rarity];
  if (!list || list.length === 0) return null;
  return list[0];
}

describe('Showcase: abertura de 1 booster para vídeo viral', () => {
  it('abre um booster e imprime 5 cartas formatadas para roteiro', async () => {
    const app = await buildApp();

    // Registrar usuário rápido
    const email = `show_${randomUUID()}@krouva.test`; // transição
    const password = 'Show@123456';
    const regRes = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { email, password, name: 'Show User' } });
    expect(regRes.statusCode).toBe(200);
    const { data: regData } = regRes.json();
    const token = regData.access_token;

    // Buscar tipo de booster
    const boostersRes = await app.inject({ method: 'GET', url: '/api/v1/boosters' });
    expect(boostersRes.statusCode).toBe(200);
    const boosterType = boostersRes.json().data[0];
    expect(boosterType).toBeTruthy();

    // Comprar 1 booster (moeda BRL)
    const purchaseRes = await app.inject({ method: 'POST', url: '/api/v1/boosters/purchase', headers: { Authorization: `Bearer ${token}` }, payload: { booster_type_id: boosterType.id, quantity: 1, currency: 'brl' } });
    expect(purchaseRes.statusCode).toBe(200);
    const boosterOpening = purchaseRes.json().data.boosters[0];
    expect(boosterOpening).toBeTruthy();

    // Abrir booster
    const openRes = await app.inject({ method: 'POST', url: '/api/v1/boosters/open', headers: { Authorization: `Bearer ${token}` }, payload: { booster_opening_id: boosterOpening.id } });
    expect(openRes.statusCode).toBe(200);
    const opened = openRes.json().data.cards;
    expect(opened.length).toBeGreaterThan(0);

    // Selecionar até 5 (caso booster tenha mais) para showcase
    const showcase = opened.slice(0, 5);

    console.log('\n================ VÍDEO SHOWCASE =================');
    console.log('Título sugerido: "ABRI UM BOOSTER E SAIU O KERNEL PRIMORDIAL?!"');
    console.log('Hook inicial (0-3s): Tela de booster + suspense sonoro.');
    console.log('Estrutura: Reveal em cascata com zoom e legendas animadas.');
    console.log('--------------------------------------------------');

    showcase.forEach((card: any, idx: number) => {
      // A lógica de teste gera base_id com padrão base-<rarity>-<index>
      const baseId: string = card.base_id || '';
      const rarity = baseId.split('-')[1] || 'trash';
      const concept = pickConcept(rarity) || {
        name: `Carta ${rarity.toUpperCase()}`,
        hook: 'Impacto imediato',
        description: 'Placeholder descritivo para carta gerada automaticamente.',
        imagePrompt: 'abstract stylized card placeholder, minimal neon outline'
      };

      console.log(`Carta #${idx + 1}`);
      console.log(` Nome: ${concept.name}`);
      console.log(` Raridade: ${rarity}`);
      console.log(` Hook: ${concept.hook}`);
      console.log(` Descrição: ${concept.description}`);
      console.log(` Prompt IA: ${concept.imagePrompt}`);
      console.log(' ---');
    });

    console.log('CTA Final (últimos 2s): Like + seguir para ver booster GODMODE completo.');
    console.log('==================================================\n');
  }, 20000);
});
