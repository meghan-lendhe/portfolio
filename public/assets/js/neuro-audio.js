/**
 * Tactile Acoustic Physical Synthesizer (Museum-Grade Micro-Acoustics)
 * - Sub-threshold felt mallet tap (70Hz low-pass impulse)
 * - Crystalline celesta harmonics (tuned pentatonic chords)
 * - Safe browser audio policy: lazy activation on user interaction
 */

(function () {
  'use strict';

  let audioCtx = null;
  let audioEnabled = false;

  const pentatonicScale = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25, 739.99, 880.0];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    audioEnabled = !!audioCtx;
    return audioCtx;
  }

  // 1. Sub-Threshold Felt Mallet Impulse (Warm low-pass thud, zero digital click)
  function playMallet(intensity = 0.024) {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.05);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(intensity, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(filter);
      filter.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  // 2. Membrane Depolarization Celesta Harmonics (Warm physical bell overtones)
  function playCelesta(freq = 587.33, volume = 0.035) {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);

      // Fundamental
      const oscBody = ctx.createOscillator();
      const gainBody = ctx.createGain();
      oscBody.type = 'sine';
      oscBody.frequency.setValueAtTime(freq, now);

      gainBody.gain.setValueAtTime(0, now);
      gainBody.gain.linearRampToValueAtTime(volume, now + 0.005);
      gainBody.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      // Crystalline overtone (2.76x ratio for delicate acoustic shimmer)
      const oscTine = ctx.createOscillator();
      const gainTine = ctx.createGain();
      oscTine.type = 'sine';
      oscTine.frequency.setValueAtTime(freq * 2.76, now);

      gainTine.gain.setValueAtTime(0, now);
      gainTine.gain.linearRampToValueAtTime(volume * 0.22, now + 0.003);
      gainTine.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      oscBody.connect(gainBody);
      gainBody.connect(filter);
      oscTine.connect(gainTine);
      gainTine.connect(filter);
      filter.connect(ctx.destination);

      oscBody.start(now);
      oscTine.start(now);
      oscBody.stop(now + 0.48);
      oscTine.stop(now + 0.09);
    } catch (e) {}
  }

  // Expose global methods
  window.NeuroAudio = {
    playMallet,
    playCelesta,
    scale: pentatonicScale
  };

  // Lazy activate audio on first user gesture
  const activateAudio = () => {
    getAudioContext();
    window.removeEventListener('pointerdown', activateAudio);
    window.removeEventListener('keydown', activateAudio);
  };
  window.addEventListener('pointerdown', activateAudio, { once: true, passive: true });
  window.addEventListener('keydown', activateAudio, { once: true, passive: true });
})();

