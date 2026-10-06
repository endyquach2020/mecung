/**
 * Dramatic Procedural Audio Synthesizer & Sound FX Engine
 * Uses Web Audio API for zero-latency, no external audio file dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMusicPlaying = false;
  private musicVolume = 0.45;
  private sfxVolume = 0.65;
  private musicInterval: number | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private stepCount = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public isPlaying(): boolean {
    return this.isMusicPlaying;
  }

  /**
   * Dramatic Cinematic Adventure Music Loop
   * Minor suspense arpeggio, dramatic bass pulse, and cinematic chords
   */
  public startMusic() {
    this.initContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Tempo: 124 BPM (Suspenseful Adventure tempo)
    const bpm = 124;
    const beatDuration = 60 / bpm; // ~0.483s per quarter note
    const sixteenth = beatDuration / 4; // ~0.12s

    // Chord progressions in D minor: Dm -> Bb -> Gm -> A7
    const chords = [
      // D minor
      { bass: 73.42, notes: [146.83, 174.61, 220.00, 293.66, 349.23, 440.00, 587.33] }, // D2, D3, F3, A3, D4, F4, A4, D5
      // Bb major
      { bass: 58.27, notes: [116.54, 146.83, 174.61, 233.08, 293.66, 349.23, 466.16] }, // Bb1, Bb2, D3, F3, Bb3, D4, F4, Bb4
      // Gm
      { bass: 49.00, notes: [98.00, 146.83, 196.00, 233.08, 293.66, 392.00, 466.16] }, // G1, G2, D3, G3, Bb3, D4, G4, Bb4
      // A suspense (A - C# - E)
      { bass: 55.00, notes: [110.00, 164.81, 220.00, 277.18, 329.63, 440.00, 554.37] }, // A1, A2, E3, A3, C#4, E4, A4, C#5
    ];

    let chordIdx = 0;
    let step = 0;

    const playLoopStep = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;
      const currentChord = chords[chordIdx];

      // Play dramatic cinematic bass pulse on quarter beats (steps 0, 4, 8, 12)
      if (step % 4 === 0) {
        this.playBassPulse(currentChord.bass, t);
        // Dramatic low kick thump
        this.playDrumThump(t);
      }

      // Play suspenseful high arpeggio note
      const notePattern = [0, 2, 4, 6, 5, 3, 2, 4, 1, 3, 5, 4, 2, 1, 3, 5];
      const noteIdx = notePattern[step % notePattern.length] % currentChord.notes.length;
      const freq = currentChord.notes[noteIdx];
      this.playArpNote(freq, t, step % 2 === 0);

      // Soft tension shaker / tick on 16th notes
      if (step % 2 === 1) {
        this.playTensionTick(t);
      }

      step++;
      if (step >= 16) {
        step = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }
    };

    // Run interval
    this.musicInterval = window.setInterval(playLoopStep, sixteenth * 1000);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private playBassPulse(freq: number, time: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(120, time + 0.35);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.42);
  }

  private playArpNote(freq: number, time: number, isAccent: boolean) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isAccent ? 1800 : 1200, time);

    const initialGain = isAccent ? 0.08 : 0.04;
    gain.gain.setValueAtTime(initialGain, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  private playDrumThump(time: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.2);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private playTensionTick(time: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'highpass' as unknown as OscillatorType;

    // Use noise-like short blip
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4000, time);

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, time);

    gain.gain.setValueAtTime(0.015, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.06);
  }

  /* ================== SOUND EFFECTS ================== */

  public playStepSound() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    this.stepCount++;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Alternate pitch slightly for realistic walking sensation
    const pitch = this.stepCount % 2 === 0 ? 320 : 360;
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.07);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playObstacleBumpSound(type: 'rock' | 'spike') {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    if (type === 'rock') {
      // Deep heavy rock impact
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.28);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.32);
    } else {
      // Sharp metallic spike trap warning click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.2);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  }

  public playCorrectSound() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Joyful sparkling fanfare chord: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.2, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.4);
    });
  }

  public playWrongSound() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Low gentle buzz
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(155.56, t); // Eb3
    osc2.frequency.setValueAtTime(146.83, t); // D3 (dissonance)

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.32);
    osc2.stop(t + 0.32);
  }

  public playObstacleClearedSound() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Whoosh / break sound + rising shimmer
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.25);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  public playVictoryFanfare() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Epic triumph melody: G4, C5, E5, G5, C6 (extended chords)
    const melody = [
      { f: 392.00, start: 0, dur: 0.18 },
      { f: 523.25, start: 0.16, dur: 0.18 },
      { f: 659.25, start: 0.32, dur: 0.22 },
      { f: 783.99, start: 0.50, dur: 0.35 },
      { f: 1046.5, start: 0.85, dur: 0.80 },
    ];

    melody.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t + note.start);

      gain.gain.setValueAtTime(0.3, t + note.start);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.start + note.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + note.start);
      osc.stop(t + note.start + note.dur + 0.05);
    });
  }
}

export const soundEngine = new SoundEngine();
