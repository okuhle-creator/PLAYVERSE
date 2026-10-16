import { StorageService } from './storage';

class SoundEffectsService {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playBeep(freq = 440, duration = 0.08, type: OscillatorType = 'sine', volume = 0.1) {
    if (StorageService.isSoundMuted()) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio not permitted or supported
    }
  }

  eatFood() {
    this.playBeep(587.33, 0.06, 'triangle', 0.15); // D5
    setTimeout(() => this.playBeep(880, 0.08, 'triangle', 0.12), 40); // A5
  }

  tileMerge() {
    this.playBeep(440, 0.05, 'sine', 0.12);
    setTimeout(() => this.playBeep(659.25, 0.08, 'sine', 0.12), 40);
  }

  cardFlip() {
    this.playBeep(320, 0.03, 'sine', 0.08);
  }

  cardMatch() {
    this.playBeep(523.25, 0.08, 'triangle', 0.12); // C5
    setTimeout(() => this.playBeep(659.25, 0.08, 'triangle', 0.12), 60); // E5
    setTimeout(() => this.playBeep(783.99, 0.12, 'triangle', 0.14), 120); // G5
  }

  ticMark() {
    this.playBeep(420, 0.04, 'sine', 0.1);
  }

  win() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.12, 'triangle', 0.15), idx * 75);
    });
  }

  gameOver() {
    this.playBeep(260, 0.15, 'sawtooth', 0.08);
    setTimeout(() => this.playBeep(180, 0.25, 'sawtooth', 0.08), 120);
  }

  click() {
    this.playBeep(800, 0.02, 'sine', 0.04);
  }
}

export const Sound = new SoundEffectsService();
