// HYBRID AUDIO SYSTEM - Tone.js + ElevenLabs
// - ElevenLabs: Cinematic sounds (explosions, legendary reveals, ambient)
// - Tone.js: Procedural UI sounds (card flips, hovers, clicks)
// Professional synthesis with ADSR envelope and layered effects

import { Howl } from 'howler';
import * as Tone from 'tone';

interface SynthConfig {
  mainFreq: number;
  harmonic?: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  volume: number;
  filterFreq?: number;
  reverbMix?: number;
}

const RARITY_SYNTH: Record<string, SynthConfig> = {
  trash: {
    mainFreq: 400,      // Snap agudo
    attack: 0.005,      // Impacto instantâneo
    decay: 0.08,
    sustain: 0.1,
    release: 0.12,
    volume: 0.3,
  },
  meme: {
    mainFreq: 600,      // Snap + ressonância
    harmonic: 1200,
    attack: 0.008,
    decay: 0.12,
    sustain: 0.2,
    release: 0.18,
    volume: 0.4,
    filterFreq: 2000,
  },
  viral: {
    mainFreq: 800,      // Snap brilhante
    harmonic: 1600,
    attack: 0.01,
    decay: 0.15,
    sustain: 0.3,
    release: 0.25,
    volume: 0.5,
    filterFreq: 3000,
  },
  legendary: {
    mainFreq: 1000,     // Impacto + whoosh
    harmonic: 2000,
    attack: 0.015,
    decay: 0.25,
    sustain: 0.4,
    release: 0.4,
    volume: 0.6,
    filterFreq: 4000,
  },
  epica: {
    mainFreq: 1200,     // Crack épico + shimmer
    harmonic: 2400,
    attack: 0.02,
    decay: 0.35,
    sustain: 0.5,
    release: 0.6,
    volume: 0.7,
    filterFreq: 6000,
  }
};

// ElevenLabs generated audio (cinematic quality)
const ELEVENLABS_AUDIO: Record<string, string> = {
  packExplosion: '/sfx/explosions/pack_explosion_epic.mp3',
  packOpen: '/sfx/explosions/pack_open_cloth.mp3',
  legendaryReveal: '/sfx/reveals/legendary_reveal.mp3',
  godmodeReveal: '/sfx/reveals/godmode_reveal.mp3',
  rareReveal: '/sfx/reveals/rare_reveal.mp3',
  ambientMystical: '/sfx/ambient/mystical_ambience.mp3',
  ambientTension: '/sfx/ambient/tension_ambience.mp3',
};

// Procedural UI sounds (Tone.js - zero latency)
const PROCEDURAL_SOUNDS = {
  cardFlip: true,
  cardHover: true,
  buttonClick: true,
};

class CardAudioSystem {
  private audioContext: AudioContext | null = null;
  private queue: Array<() => Promise<void>> = [];
  private isPlaying = false;
  private howlerCache: Map<string, Howl> = new Map();
  private toneInitialized = false;
  private ambientLoop: Howl | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Initialize Tone.js (call on first user interaction)
  private async initTone() {
    if (this.toneInitialized) return;
    
    try {
      await Tone.start();
      this.toneInitialized = true;
      console.log('🎵 Tone.js initialized');
    } catch (err) {
      console.error('Failed to init Tone.js:', err);
    }
  }

  // ==================== PROCEDURAL SOUNDS (Tone.js) ====================
  
  // Card flip - Quick snap with synthetic envelope
  async playCardFlipProcedural() {
    await this.initTone();
    
    const synth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.08,
        sustain: 0,
        release: 0.12
      }
    }).toDestination();
    
    synth.volume.value = -15; // Subtle
    synth.triggerAttackRelease('C5', '0.1');
    
    // Cleanup
    setTimeout(() => synth.dispose(), 200);
  }

  // Card hover - Soft shimmer
  async playCardHoverProcedural() {
    await this.initTone();
    
    const synth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0,
        release: 0.15
      }
    }).toDestination();
    
    synth.volume.value = -20; // Very subtle
    synth.triggerAttackRelease('G6', '0.08');
    
    setTimeout(() => synth.dispose(), 200);
  }

  // Button click - Satisfying pop
  async playButtonClickProcedural() {
    await this.initTone();
    
    const synth = new Tone.MembraneSynth({
      pitchDecay: 0.02,
      octaves: 6,
      envelope: {
        attack: 0.001,
        decay: 0.05,
        sustain: 0,
        release: 0.08
      }
    }).toDestination();
    
    synth.volume.value = -12;
    synth.triggerAttackRelease('A4', '0.05');
    
    setTimeout(() => synth.dispose(), 150);
  }

  // Professional synthesis with ADSR envelope and realistic textures
  private async playSynth(config: SynthConfig): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      // Create realistic card/plastic sounds using noise + filters
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate noise burst (simulates card snap/plastic crack)
      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (ctx.sampleRate * 0.1));
        data[i] = (Math.random() * 2 - 1) * decay;
      }
      
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      
      // High-pass filter for crisp sound (card texture)
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 1000 + (config.mainFreq * 2);
      highpass.Q.value = 5;
      
      // Band-pass for resonance (plastic/paper body)
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = config.mainFreq;
      bandpass.Q.value = 10;
      
      // Tone oscillator for musical element
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = config.mainFreq;
      
      // Harmonic layer
      let osc2: OscillatorNode | null = null;
      if (config.harmonic) {
        osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = config.harmonic;
      }
      
      // Noise gain (card snap texture)
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(config.volume * 0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      
      // Tone gain (musical ping)
      const toneGain = ctx.createGain();
      toneGain.gain.setValueAtTime(0, now);
      toneGain.gain.linearRampToValueAtTime(config.volume * 0.6, now + config.attack);
      const sustainLevel = config.volume * config.sustain * 0.6;
      toneGain.gain.linearRampToValueAtTime(sustainLevel, now + config.attack + config.decay);
      const releaseStart = now + config.attack + config.decay + 0.1;
      toneGain.gain.setValueAtTime(sustainLevel, releaseStart);
      toneGain.gain.exponentialRampToValueAtTime(0.001, releaseStart + config.release);
      
      // Master output
      const masterGain = ctx.createGain();
      masterGain.gain.value = 1.0;
      
      // Connect noise path (card texture)
      noiseSource.connect(highpass);
      highpass.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(masterGain);
      
      // Connect tone path (musical element)
      osc.connect(toneGain);
      toneGain.connect(masterGain);
      
      if (osc2) {
        const harm2Gain = ctx.createGain();
        harm2Gain.gain.value = 0.2;
        osc2.connect(harm2Gain);
        harm2Gain.connect(masterGain);
      }
      
      masterGain.connect(ctx.destination);
      
      // Start all sources
      const totalDuration = config.attack + config.decay + 0.1 + config.release;
      noiseSource.start(now);
      osc.start(now);
      if (osc2) osc2.start(now);
      
      noiseSource.stop(now + 0.15);
      osc.stop(now + totalDuration);
      if (osc2) osc2.stop(now + totalDuration);
      
      setTimeout(() => resolve(), totalDuration * 1000);
    });
  }

  // Load and cache Howler sound (ElevenLabs audio)
  private getHowl(key: string): Howl | null {
    if (this.howlerCache.has(key)) {
      return this.howlerCache.get(key)!;
    }
    
    const url = ELEVENLABS_AUDIO[key];
    if (!url) return null;
    
    const howl = new Howl({
      src: [url],
      volume: 0.7,
      preload: true,
      onloaderror: (id, err) => {
        console.warn(`⚠️ Failed to load ${key}:`, err);
      }
    });
    
    this.howlerCache.set(key, howl);
    return howl;
  }

  private async processQueue() {
    if (this.isPlaying || this.queue.length === 0) return;
    
    this.isPlaying = true;
    while (this.queue.length > 0) {
      const playFn = this.queue.shift();
      if (playFn) {
        await playFn();
        // Small delay between sounds
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    this.isPlaying = false;
  }

  playCardSound(rarity: string, isGodmode: boolean = false) {
    // Special cases for ElevenLabs cinematic audio
    if (isGodmode) {
      this.playGodmodeReveal();
      return;
    }
    
    if (rarity.toLowerCase() === 'legendary' || rarity.toLowerCase() === 'epica') {
      this.playLegendaryReveal();
      return;
    }

    if (rarity.toLowerCase() === 'viral' || rarity.toLowerCase() === 'meme') {
      this.playRareReveal();
      return;
    }
    
    // Common cards - use procedural
    const config = RARITY_SYNTH[rarity.toLowerCase()] || RARITY_SYNTH.trash;
    this.queue.push(() => this.playSynth(config));
    this.processQueue();
  }

  // Play pack opening sound (plastic rip simulation)
  playPackOpen() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Create noise for plastic texture
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Plastic rip: sharp attack, crackling texture
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const env = Math.exp(-t * 8); // Fast decay
      const crackle = Math.sin(t * 200) * Math.random(); // Texture
      data[i] = ((Math.random() * 2 - 1) * 0.7 + crackle * 0.3) * env;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Filter sweep (ripping motion)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.2);
    filter.Q.value = 3;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noiseSource.start(now);
    noiseSource.stop(now + 0.3);
  }

  // ==================== ELEVENLABS CINEMATIC SOUNDS ====================
  
  // Play pack explosion (ElevenLabs generated)
  playPackExplosion() {
    const howl = this.getHowl('packExplosion');
    if (howl) {
      howl.play();
    } else {
      // Fallback to old synthesis
      this.playPackOpen();
    }
  }

  // Play legendary card reveal (ElevenLabs generated)
  playLegendaryReveal() {
    const howl = this.getHowl('legendaryReveal');
    if (howl) {
      howl.play();
    } else {
      console.warn('⚠️ Legendary reveal audio not loaded');
    }
  }

  // Play godmode card reveal (ElevenLabs generated)
  playGodmodeReveal() {
    const howl = this.getHowl('godmodeReveal');
    if (howl) {
      howl.play();
    } else {
      console.warn('⚠️ Godmode reveal audio not loaded');
    }
  }

  // Play rare card reveal (ElevenLabs generated)
  playRareReveal() {
    const howl = this.getHowl('rareReveal');
    if (howl) {
      howl.play();
    } else {
      console.warn('⚠️ Rare reveal audio not loaded');
    }
  }

  // Start ambient background music (looping)
  startAmbient(type: 'mystical' | 'tension' = 'mystical') {
    // Stop existing ambient
    if (this.ambientLoop) {
      this.ambientLoop.fade(this.ambientLoop.volume(), 0, 500);
      setTimeout(() => this.ambientLoop?.stop(), 500);
    }

    const key = type === 'mystical' ? 'ambientMystical' : 'ambientTension';
    const howl = this.getHowl(key);
    
    if (howl) {
      this.ambientLoop = howl;
      howl.loop(true);
      howl.volume(0);
      howl.play();
      howl.fade(0, 0.3, 1000); // Fade in
    }
  }

  // Stop ambient background
  stopAmbient() {
    if (this.ambientLoop) {
      this.ambientLoop.fade(this.ambientLoop.volume(), 0, 1000);
      setTimeout(() => {
        this.ambientLoop?.stop();
        this.ambientLoop = null;
      }, 1000);
    }
  }

  // ==================== UNIFIED API ====================

  // Main card flip sound (procedural for zero latency)
  playCardFlip() {
    this.playCardFlipProcedural();
  }

  // Card hover sound (procedural)
  playCardHover() {
    this.playCardHoverProcedural();
  }

  // Button click sound (procedural)
  playButtonClick() {
    this.playButtonClickProcedural();
  }

  // Preload ElevenLabs audio files
  preloadAudio() {
    Object.keys(ELEVENLABS_AUDIO).forEach(key => {
      this.getHowl(key);
    });
  }

  // Play multiple sounds in sequence (for batch reveals)
  playSequence(cards: Array<{ rarity: string; is_godmode: boolean }>) {
    cards.forEach(card => {
      this.playCardSound(card.rarity, card.is_godmode);
    });
  }

  // Clear queue (useful when skipping animations)
  clearQueue() {
    this.queue = [];
  }
}

// Singleton instance
export const cardAudio = new CardAudioSystem();

// Haptic feedback patterns
export function triggerHaptic(rarity: string, isGodmode: boolean = false) {
  if (!navigator.vibrate) return;

  const patterns: Record<string, number[]> = {
    trash: [],
    meme: [50],
    viral: [100, 50, 100],
    legendary: [200, 100, 200, 100, 300],
    epica: [300, 100, 300, 100, 300, 100, 500, 200, 500, 200, 1000]
  };

  const effectiveRarity = isGodmode ? 'epica' : rarity.toLowerCase();
  const pattern = patterns[effectiveRarity] || [];
  
  if (pattern.length > 0) {
    navigator.vibrate(pattern);
  }
}
