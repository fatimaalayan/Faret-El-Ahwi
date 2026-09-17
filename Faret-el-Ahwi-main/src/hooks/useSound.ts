import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../engine/gameStore';
import { audioAssets, SoundKey } from '../assets/audio';

// Shared singleton AudioContext across app
let sharedAudioCtx: AudioContext | null = null;
let audioBufferCache: Partial<Record<SoundKey, AudioBuffer>> = {};
let isPreloading = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      sharedAudioCtx = new AudioCtxClass();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

// Preload local WAV buffers into AudioBuffers
async function preloadAudioBuffers() {
  if (isPreloading || typeof window === 'undefined') return;
  const ctx = getAudioContext();
  if (!ctx) return;
  isPreloading = true;

  for (const [key, url] of Object.entries(audioAssets)) {
    try {
      if (!audioBufferCache[key as SoundKey]) {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const decoded = await ctx.decodeAudioData(arrayBuffer);
        audioBufferCache[key as SoundKey] = decoded;
      }
    } catch {
      // Fallback synthesizer handles any decode errors gracefully
    }
  }
}

// Procedural Web Audio synthesizers (zero-delay guaranteed fallback)
function synthesizeSound(ctx: AudioContext, soundKey: SoundKey, masterGain: GainNode) {
  const now = ctx.currentTime;

  switch (soundKey) {
    case 'buttonPress': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }

    case 'fireIgnition': {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.25);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(350, now);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
      break;
    }

    case 'coffeeOverflow': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.6);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.65);
      break;
    }

    case 'roundLossSting': {
      // Minor sad sting chord
      [196, 155.5, 130.8].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 1.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.2);
      });
      break;
    }
  }
}

export const useSound = () => {
  const muted = useGameStore((state) => state.muted);
  const setStoreMuted = useGameStore((state) => state.setMuted);

  // Boiling loop nodes
  const boilingSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const boilingGainRef = useRef<GainNode | null>(null);
  const boilingFilterRef = useRef<BiquadFilterNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize master gain & user gesture handler
  useEffect(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!masterGainRef.current) {
      const master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.8;
      master.connect(ctx.destination);
      masterGainRef.current = master;
    }

    preloadAudioBuffers();

    const handleUserGesture = () => {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    };

    window.addEventListener('click', handleUserGesture, { once: true });
    window.addEventListener('touchstart', handleUserGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
    };
  }, [muted]);

  // Sync muted state to master gain
  useEffect(() => {
    if (masterGainRef.current && sharedAudioCtx) {
      masterGainRef.current.gain.setValueAtTime(
        muted ? 0 : 0.8,
        sharedAudioCtx.currentTime
      );
    }
    if (muted) {
      stopBoiling();
    }
  }, [muted]);

  const setMuted = useCallback((val: boolean) => {
    setStoreMuted(val);
  }, [setStoreMuted]);

  // Play one-shot sound
  const play = useCallback((soundKey: SoundKey) => {
    if (muted) return;
    const ctx = getAudioContext();
    if (!ctx || !masterGainRef.current) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const cached = audioBufferCache[soundKey];
    if (cached) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = cached;
        source.connect(masterGainRef.current);
        source.start(0);
        return;
      } catch {
        // Fallback to synth if buffer playback failed
      }
    }

    // Direct synthesizer playback
    synthesizeSound(ctx, soundKey, masterGainRef.current);
  }, [muted]);

  // Start continuous boiling loop
  const startBoiling = useCallback(() => {
    if (muted) return;
    const ctx = getAudioContext();
    if (!ctx || !masterGainRef.current) return;

    stopBoiling();

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    const cached = audioBufferCache.boilingLoop;
    if (cached) {
      const source = ctx.createBufferSource();
      source.buffer = cached;
      source.loop = true;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(masterGainRef.current);
      source.start(0);
      boilingSourceRef.current = source;
    } else {
      // Procedural simmer oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGainRef.current);
      osc.start(0);
      boilingSourceRef.current = osc as unknown as AudioBufferSourceNode;
    }

    boilingGainRef.current = gain;
    boilingFilterRef.current = filter;
  }, [muted]);

  // Update boiling parameters scaling with tension (0 to 1)
  const updateBoiling = useCallback((tension: number) => {
    if (muted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!boilingSourceRef.current && tension > 0.05) {
      startBoiling();
    }

    const clamped = Math.max(0, Math.min(1, tension));
    const now = ctx.currentTime;

    if (boilingGainRef.current) {
      // Volume scales from subtle simmer 0.08 to loud bubbling 0.7
      const targetGain = 0.08 + clamped * 0.62;
      boilingGainRef.current.gain.setTargetAtTime(targetGain, now, 0.05);
    }

    if (boilingFilterRef.current) {
      // Filter opens up as heat rises (350Hz muffled to 2200Hz bright rumble)
      const targetFreq = 350 + clamped * 1850;
      boilingFilterRef.current.frequency.setTargetAtTime(targetFreq, now, 0.05);
    }

    if (boilingSourceRef.current && 'playbackRate' in boilingSourceRef.current) {
      // Speed accelerates as pot approaches boiling over (0.85x to 1.5x)
      const targetRate = 0.85 + clamped * 0.65;
      boilingSourceRef.current.playbackRate.setTargetAtTime(targetRate, now, 0.05);
    }
  }, [muted, startBoiling]);

  // Stop boiling loop
  const stopBoiling = useCallback(() => {
    if (boilingSourceRef.current) {
      try {
        boilingSourceRef.current.stop();
        boilingSourceRef.current.disconnect();
      } catch {
        // Already stopped
      }
      boilingSourceRef.current = null;
    }
    boilingGainRef.current = null;
    boilingFilterRef.current = null;
  }, []);

  return {
    play,
    muted,
    setMuted,
    startBoiling,
    updateBoiling,
    stopBoiling,
  };
};

export default useSound;
