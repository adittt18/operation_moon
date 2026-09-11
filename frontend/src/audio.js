// audio.js - Synthesizes 5 distinct professional space telemetry & mission sounds using Web Audio API

export const SOUND_PRESETS = [
  { id: 'deep_space_chime', name: 'Deep Space Chime (Resonant Chord)' },
  { id: 'cosmic_pulse', name: 'Cosmic Pulse (Pulsar Beep)' },
  { id: 'telemetry_chirp', name: 'Telemetry Chirp (High-Tech Ping)' },
  { id: 'orbital_beacon', name: 'Orbital Beacon (Sub-Harmonic Echo)' },
  { id: 'isro_lunar_link', name: 'ISRO Lunar Link (Mission Acknowledgment)' },
];

export function getSavedSoundSettings() {
  try {
    const sound = localStorage.getItem('pixelmoon-sound-preset') || 'deep_space_chime';
    const vol = localStorage.getItem('pixelmoon-volume');
    const enabled = localStorage.getItem('pixelmoon-sound');
    return {
      preset: sound,
      volume: vol !== null ? parseFloat(vol) : 0.75,
      enabled: enabled !== null ? JSON.parse(enabled) : true,
    };
  } catch {
    return { preset: 'deep_space_chime', volume: 0.75, enabled: true };
  }
}

export function playNotificationSound(soundId = null, customVolume = null) {
  try {
    const settings = getSavedSoundSettings();
    if (customVolume === null && !settings.enabled) return;

    const volume = customVolume !== null ? customVolume : settings.volume;
    if (volume <= 0) return;

    const activeSound = soundId || settings.preset;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    switch (activeSound) {
      case 'cosmic_pulse': {
        // Pulsar beep with quick pitch drop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.4, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }

      case 'telemetry_chirp': {
        // Fast dual chirp like satellite telemetry downlink
        [0, 0.08].forEach((delay, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const startFreq = idx === 0 ? 1400 : 1850;
          osc.frequency.setValueAtTime(startFreq, now + delay);
          osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, now + delay + 0.06);
          gain.gain.setValueAtTime(0.001, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.32, now + delay + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + delay);
          osc.stop(now + delay + 0.07);
        });
        break;
      }

      case 'orbital_beacon': {
        // Sub-harmonic echo tone with soft reverb tail
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc2.frequency.setValueAtTime(1046.5, now); // C6
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.85);
        osc2.stop(now + 0.85);
        break;
      }

      case 'isro_lunar_link': {
        // ISRO tri-tone ascending acknowledgment (G5 - C6 - E6)
        const notes = [783.99, 1046.5, 1318.51];
        notes.forEach((freq, idx) => {
          const delay = idx * 0.09;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(0.001, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.3, now + delay + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.45);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + delay);
          osc.stop(now + delay + 0.45);
        });
        break;
      }

      case 'deep_space_chime':
      default: {
        // Resonant harmonic chime (F#5, A#5, C#6)
        const chimeNotes = [739.99, 932.33, 1108.73];
        chimeNotes.forEach((freq, i) => {
          const delay = i * 0.1;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(0.001, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.28, now + delay + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.65);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + delay);
          osc.stop(now + delay + 0.65);
        });
        break;
      }
    }
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}

