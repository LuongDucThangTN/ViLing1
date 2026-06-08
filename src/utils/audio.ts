/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  return audioCtx;
}

export function playBeep(
  freq: number,
  type: OscillatorType,
  duration: number,
  enabled: boolean
) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

export function playSuccessSound(enabled: boolean) {
  playBeep(523.25, "sine", 0.1, enabled); // C5
  setTimeout(() => {
    playBeep(659.25, "sine", 0.15, enabled); // E5
  }, 80);
  setTimeout(() => {
    playBeep(783.99, "sine", 0.3, enabled); // G5
  }, 160);
}

export function playFailSound(enabled: boolean) {
  playBeep(220, "sawtooth", 0.25, enabled); // A3
  setTimeout(() => {
    playBeep(180, "sawtooth", 0.35, enabled); // F#3
  }, 100);
}

export function playClickSound(enabled: boolean) {
  playBeep(440, "sine", 0.05, enabled); // A4
}

export function playSwipeSound(enabled: boolean) {
  playBeep(300, "triangle", 0.08, enabled);
}
