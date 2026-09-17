import { TIMER_RANGES, TimerRange } from '../config/constants';

/**
 * Returns a randomized round duration in seconds based on player count and TIMER_RANGES.
 */
export function getRandomRoundDuration(
  playerCount: number,
  ranges: readonly TimerRange[] = TIMER_RANGES
): number {
  const range = ranges.find((r) => playerCount >= r.minPlayers && playerCount <= r.maxPlayers);
  if (!range) {
    // Fallback if player count is somehow outside defined ranges
    return 30;
  }
  // Random duration between minSeconds and maxSeconds (inclusive of fractions for tension)
  return range.minSeconds + Math.random() * (range.maxSeconds - range.minSeconds);
}

// Module-level singleton timer reference to enforce exactly one timer at a time
let activeTimerInterval: ReturnType<typeof setInterval> | null = null;
let activeTimerStartTime: number | null = null;
let activeTimerDurationMs: number | null = null;
let activeVisibilityListener: (() => void) | null = null;

/**
 * Stops and clears any currently active round timer.
 */
export function stopRoundTimer(): void {
  if (activeTimerInterval !== null) {
    clearInterval(activeTimerInterval);
    activeTimerInterval = null;
  }
  if (activeVisibilityListener !== null && typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', activeVisibilityListener);
    activeVisibilityListener = null;
  }
  activeTimerStartTime = null;
  activeTimerDurationMs = null;
}

/**
 * Checks if a timer is currently active.
 */
export function isTimerActive(): boolean {
  return activeTimerInterval !== null;
}

/**
 * Starts a single interval timer using Date.now() to calculate tension (0 to 1).
 * Issues a dev-only warning if a second timer is triggered while one is active.
 */
export function startRoundTimer(
  durationSeconds: number,
  onTick: (tension: number) => void,
  onExpire: () => void
): () => void {
  if (activeTimerInterval !== null) {
    console.warn(
      '[ZAKA TimerEngine] Warning: Attempted to start a timer while another timer is already running. Clearing previous timer.'
    );
    stopRoundTimer();
  }

  const durationMs = durationSeconds * 1000;
  const startTime = Date.now();

  activeTimerStartTime = startTime;
  activeTimerDurationMs = durationMs;

  const evaluateProgress = () => {
    if (activeTimerStartTime === null || activeTimerDurationMs === null) {
      stopRoundTimer();
      return;
    }

    const elapsed = Date.now() - activeTimerStartTime;
    const progress = Math.min(1, Math.max(0, elapsed / activeTimerDurationMs));

    onTick(progress);

    if (progress >= 1) {
      stopRoundTimer();
      onExpire();
    }
  };

  // Immediate initial tick
  onTick(0);

  // Tick every 50ms (~20fps) for smooth tension rendering and prompt expiration
  activeTimerInterval = setInterval(evaluateProgress, 50);

  // Sync immediately upon regaining foreground visibility
  if (typeof document !== 'undefined') {
    activeVisibilityListener = () => {
      if (document.visibilityState === 'visible') {
        evaluateProgress();
      }
    };
    document.addEventListener('visibilitychange', activeVisibilityListener);
  }

  return () => {
    stopRoundTimer();
  };
}
