'use client';

class MeditativeSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private noiseNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  constructor() {}

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public play432Hz() {
    this.stop();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;

    // Create 432Hz fundamental carrier
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(432, t);
    gain1.gain.setValueAtTime(0.04, t);

    // Create 434Hz offset carrier for 2Hz binaural relaxation beat
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(434, t);
    gain2.gain.setValueAtTime(0.04, t);

    // Deep grounding subharmonic pad (108Hz)
    const osc3 = this.ctx.createOscillator();
    const gain3 = this.ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(108, t);
    gain3.gain.setValueAtTime(0.05, t);

    // Connecting nodes
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);
    gain3.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc3.start(t);

    this.oscillators = [
      { osc: osc1, gain: gain1 },
      { osc: osc2, gain: gain2 },
      { osc: osc3, gain: gain3 }
    ];

    // Smooth entry
    this.masterGain.gain.linearRampToValueAtTime(0.6, t + 4.0);
  }

  public playOcean() {
    this.stop();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;

    // Synthesize pinkish random noise for water/rain effect
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Filter white noise to create pinkish/oceanish warmer tone
      output[i] = (lastOut * 0.95 + white * 0.05) * 0.6;
      lastOut = output[i];
    }

    const bufferSource = this.ctx.createBufferSource();
    bufferSource.buffer = noiseBuffer;
    bufferSource.loop = true;

    // Create sweeping low-pass filter to simulate wave motion
    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'lowpass';
    this.noiseFilter.frequency.setValueAtTime(350, t);
    this.noiseFilter.Q.setValueAtTime(1.2, t);

    // Simple LFO oscillating at ~0.08 Hz (12.5 seconds cycle) to modulate filter sweep
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(0.08, t);

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(250, t); // swing filter frequency from 350-250 to 350+250

    // Connect LFO modulation to filter cutoff
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.noiseFilter.frequency);

    // Chain pink noise through filter to master gain
    bufferSource.connect(this.noiseFilter);
    this.noiseFilter.connect(this.masterGain);

    // Start playback
    bufferSource.start(t);
    this.lfo.start(t);

    this.noiseNode = bufferSource as any; // Store so we can stop it

    // Smooth master fade in
    this.masterGain.gain.linearRampToValueAtTime(0.4, t + 4.0);
  }

  public setVolume(volume: number) {
    if (this.ctx && this.masterGain) {
      // volume 0 to 1
      const t = this.ctx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(volume * 0.8, t + 0.5);
    }
  }

  public stop() {
    const t = this.ctx ? this.ctx.currentTime : 0;
    
    // Quick fade out first to prevent clicks
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
      this.masterGain.gain.linearRampToValueAtTime(0, t + 1.2);
    }

    setTimeout(() => {
      // Oscillators cleanup
      this.oscillators.forEach(({ osc, gain }) => {
        try {
          osc.stop();
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      });
      this.oscillators = [];

      // Ocean sweep LFO cleanup
      if (this.lfo) {
        try {
          this.lfo.stop();
          this.lfo.disconnect();
        } catch (e) {}
        this.lfo = null;
      }
      if (this.lfoGain) {
        try {
          this.lfoGain.disconnect();
        } catch (e) {}
        this.lfoGain = null;
      }

      // Noise source cleanup
      if (this.noiseNode) {
        try {
          (this.noiseNode as any).stop();
          this.noiseNode.disconnect();
        } catch (e) {}
        this.noiseNode = null;
      }

      if (this.noiseFilter) {
        try {
          this.noiseFilter.disconnect();
        } catch (e) {}
        this.noiseFilter = null;
      }
    }, 1300);
  }
}

// Export singleton instance safely
let audioManagerInstance: MeditativeSynth | null = null;
export function getAudioManager(): MeditativeSynth {
  if (typeof window === 'undefined') {
    return {} as MeditativeSynth; // Dummy for server-side Next.js compilation
  }
  if (!audioManagerInstance) {
    audioManagerInstance = new MeditativeSynth();
  }
  return audioManagerInstance;
}
