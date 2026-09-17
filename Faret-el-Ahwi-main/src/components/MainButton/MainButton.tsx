import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore, GamePhase } from '../../engine/gameStore';
import { useSound } from '../../hooks/useSound';
import { useHaptics } from '../../hooks/useHaptics';
import { Play, Flag, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

export interface MainButtonProps {
  className?: string;
  variant?: 'knob' | 'full';
  customPhase?: GamePhase;
}

export const MainButton: React.FC<MainButtonProps> = ({
  className = '',
  variant = 'full',
  customPhase,
}) => {
  const storePhase = useGameStore((state) => state.phase);
  const phase = customPhase || storePhase;

  const startGame = useGameStore((state) => state.startGame);
  const forfeitRound = useGameStore((state) => state.forfeitRound);
  const resetToSetup = useGameStore((state) => state.resetToSetup);

  const sound = useSound();
  const haptics = useHaptics();

  // Debouncing ref to prevent rapid double-tap action fires
  const lastActionTimeRef = useRef<number>(0);

  // Forfeit confirmation states:
  // 1) Press-and-hold (~450ms)
  // 2) Single-tap visual arming (~600ms)
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 1
  const [isArmed, setIsArmed] = useState(false);

  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartRef = useRef<number>(0);
  const armedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const HOLD_DURATION_MS = 450;
  const ARMED_DURATION_MS = 600;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      if (armedTimeoutRef.current) clearTimeout(armedTimeoutRef.current);
    };
  }, []);

  // Safe action invoker with debouncing
  const invokeSafeAction = useCallback((action: () => void) => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 500) {
      return;
    }
    lastActionTimeRef.current = now;
    action();
  }, []);

  // Handle press and hold logic for forfeit
  const clearHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  const handlePointerDown = () => {
    if (phase !== 'ROUND_ACTIVE') return;

    // If already armed from a prior tap, a second tap immediately forfeits!
    if (isArmed) {
      if (armedTimeoutRef.current) clearTimeout(armedTimeoutRef.current);
      setIsArmed(false);
      sound.play('buttonPress');
      haptics.loss();
      invokeSafeAction(() => forfeitRound());
      return;
    }

    holdStartRef.current = Date.now();
    setIsHolding(true);
    setHoldProgress(0);

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(1, elapsed / HOLD_DURATION_MS);
      setHoldProgress(progress);

      if (progress >= 1) {
        clearHold();
        sound.play('buttonPress');
        haptics.loss();
        invokeSafeAction(() => forfeitRound());
      }
    }, 25);
  };

  const handlePointerUp = () => {
    if (phase !== 'ROUND_ACTIVE') return;

    if (isHolding) {
      const elapsed = Date.now() - holdStartRef.current;
      clearHold();

      // If it was a short tap (< 300ms) and not already armed, visually arm for 600ms
      if (elapsed < 300 && !isArmed) {
        sound.play('buttonPress');
        haptics.buttonPress();
        setIsArmed(true);
        if (armedTimeoutRef.current) clearTimeout(armedTimeoutRef.current);
        armedTimeoutRef.current = setTimeout(() => {
          setIsArmed(false);
        }, ARMED_DURATION_MS);
      }
    }
  };

  const handlePointerLeave = () => {
    if (phase === 'ROUND_ACTIVE' && isHolding) {
      clearHold();
    }
  };

  // Primary click handler for non-ROUND_ACTIVE phases or fallback
  const handleClick = () => {
    if (phase === 'READY') {
      sound.play('buttonPress');
      sound.play('fireIgnition');
      haptics.buttonPress();
      invokeSafeAction(() => startGame());
    } else if (phase === 'ROUND_END') {
      sound.play('buttonPress');
      haptics.buttonPress();
      invokeSafeAction(() => resetToSetup());
    }
  };

  // Render for READY Phase
  if (phase === 'READY') {
    return (
      <button
        type="button"
        id="main-action-btn-ready"
        onClick={handleClick}
        className={`min-h-[56px] w-full px-6 py-3.5 rounded-2xl font-black text-lg bg-leb-red text-white hover:bg-leb-red-hover active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer select-none border-2 border-red-700/40 relative overflow-hidden group ${className}`}
        aria-label="ابدأ الجولة • Start Round"
      >
        {/* Ignition knob rotary accent glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-white/20 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/40 shadow-inner">
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </div>
        <span className="text-xl font-black tracking-tight">ابدأ</span>
        <span className="text-xs font-mono font-bold opacity-80">(Start)</span>
      </button>
    );
  }

  // Render for ROUND_ACTIVE Phase: Forfeit Knob with Hold / Tap-to-Arm confirmation
  if (phase === 'ROUND_ACTIVE') {
    return (
      <div className={`w-full flex flex-col items-center gap-1 ${className}`}>
        <button
          type="button"
          id="main-action-btn-forfeit"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          className={`relative min-h-[48px] w-full px-5 py-2.5 rounded-2xl font-bold text-sm transition-all select-none overflow-hidden cursor-pointer flex items-center justify-center gap-2 border-2 ${
            isArmed
              ? 'bg-leb-red text-white border-red-700 shadow-md animate-pulse scale-[1.02]'
              : isHolding
                ? 'bg-leb-red/20 text-leb-red border-leb-red shadow-inner'
                : 'bg-app-surface text-app-muted border-app-border hover:text-leb-red hover:border-leb-red/40 hover:bg-leb-red/5'
          }`}
          aria-label="استسلام / أعلن الخسارة في هذه الجولة"
        >
          {/* Press and Hold Progress Fill Background */}
          {isHolding && (
            <motion.div
              className="absolute inset-0 bg-leb-red/25 pointer-events-none origin-left"
              style={{ width: `${Math.round(holdProgress * 100)}%` }}
            />
          )}

          {/* Icon & Label depending on Arm/Hold State */}
          <div className="relative z-10 flex items-center justify-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isArmed ? 'bg-white/30 text-white' : 'bg-app-surface-alt text-app-muted'
              }`}
            >
              <Flag className="w-3.5 h-3.5 fill-current" />
            </div>

            <span className="font-extrabold text-sm">
              {isArmed
                ? 'اضغط مرة أخرى للتأكيد!'
                : isHolding
                  ? 'جارٍ الاستسلام... استمر بالضغط'
                  : 'استسلام (اضغط أو علّق)'}
            </span>

            {isArmed && (
              <span className="text-[10px] font-mono opacity-90 font-bold bg-black/20 px-1.5 py-0.5 rounded-md">
                تأكيد
              </span>
            )}
          </div>
        </button>

        {/* Subtle helper note */}
        <span className="text-[10px] text-app-muted font-medium">
          {isArmed ? 'ينتهي التأكيد خلال لحظات' : 'اضغط للتأكيد أو علّق بالضغط للاستسلام'}
        </span>
      </div>
    );
  }

  // Render for ROUND_END Phase: "العب مرة تانية" / Play Again → resetToSetup()
  return (
    <button
      type="button"
      id="main-action-btn-play-again"
      onClick={handleClick}
      className={`min-h-[56px] w-full px-6 py-3.5 rounded-2xl font-black text-lg bg-leb-red text-white hover:bg-leb-red-hover active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer select-none border-2 border-red-700/40 relative overflow-hidden group ${className}`}
      aria-label="العب مرة تانية • Play Again"
    >
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/40 shadow-inner">
        <RotateCcw className="w-4 h-4 stroke-[2.5]" />
      </div>
      <span className="text-xl font-black tracking-tight">العب مرة تانية</span>
      <span className="text-xs font-mono font-bold opacity-80">(Play Again)</span>
    </button>
  );
};

export default MainButton;
