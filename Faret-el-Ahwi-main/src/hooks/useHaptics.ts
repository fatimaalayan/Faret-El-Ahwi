import { useGameStore } from '../engine/gameStore';

export type HapticPattern = 'buttonPress' | 'tensionPulse' | 'overflow' | 'loss';

export const useHaptics = () => {
  const muted = useGameStore((state) => state.muted);

  const vibrate = (pattern: number | number[]) => {
    // Feature detection and mute check
    if (muted) return;
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
      return;
    }

    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors on unsupported or locked environments
    }
  };

  const trigger = (type: HapticPattern, tension: number = 0) => {
    if (muted) return;

    switch (type) {
      case 'buttonPress':
        vibrate(15);
        break;

      case 'tensionPulse':
        if (tension > 0.8) {
          vibrate([30, 40, 30]);
        } else if (tension > 0.5) {
          vibrate(25);
        } else {
          vibrate(15);
        }
        break;

      case 'overflow':
        vibrate([70, 40, 100, 50, 180]);
        break;

      case 'loss':
        vibrate([160, 90, 240]);
        break;
    }
  };

  return {
    trigger,
    buttonPress: () => trigger('buttonPress'),
    tensionPulse: (t: number) => trigger('tensionPulse', t),
    overflow: () => trigger('overflow'),
    loss: () => trigger('loss'),
  };
};

export default useHaptics;
