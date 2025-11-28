// Audio system for card reveals with rarity-based sound effects
// Uses Web Audio API with generated tones until real SFX assets are added

interface AudioConfig {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
}

const RARITY_SOUNDS: Record<string, AudioConfig> = {
  trash: {
    frequency: 200,
    duration: 0.15,
    volume: 0.2,
    type: 'sine'
  },
  meme: {
    frequency: 350,
    duration: 0.25,
    volume: 0.3,
    type: 'sine'
  },
  viral: {
    frequency: 500,
    duration: 0.4,
    volume: 0.4,
    type: 'square'
  },
  legendary: {
    frequency: 700,
    duration: 0.6,
    volume: 0.5,
    type: 'square'
  },
  epica: {
    frequency: 900,
    duration: 1.0,
    volume: 0.6,
    type: 'sawtooth'
  }
};

class CardAudioSystem {
  private audioContext: AudioContext | null = null;
  private queue: Array<() => Promise<void>> = [];
  private isPlaying = false;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private async playTone(config: AudioConfig): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = config.type;
      oscillator.frequency.value = config.frequency;
      
      gainNode.gain.setValueAtTime(config.volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + config.duration);

      oscillator.onended = () => resolve();
    });
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
    // Godmode overrides rarity
    const effectiveRarity = isGodmode ? 'epica' : rarity.toLowerCase();
    const config = RARITY_SOUNDS[effectiveRarity] || RARITY_SOUNDS.trash;

    // Add to queue
    this.queue.push(() => this.playTone(config));
    this.processQueue();
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
