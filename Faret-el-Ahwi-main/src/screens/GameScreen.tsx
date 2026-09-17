import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../engine/gameStore';
import { stopRoundTimer } from '../engine/timerEngine';
import { CoffeePot } from '../components/CoffeePot/CoffeePot';
import { MainButton } from '../components/MainButton/MainButton';
import { MuteToggle } from '../components/MuteToggle/MuteToggle';
import { useSound } from '../hooks/useSound';
import { useHaptics } from '../hooks/useHaptics';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Flame, RotateCcw } from 'lucide-react';

export const GameScreen: React.FC = () => {
  const players = useGameStore((state) => state.players);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const currentQuestionText = useGameStore((state) => state.currentQuestionText);
  const tension = useGameStore((state) => state.tension);
  const nextPlayer = useGameStore((state) => state.nextPlayer);
  const resetToSetup = useGameStore((state) => state.resetToSetup);

  const sound = useSound();
  const haptics = useHaptics();
  const lastTensionTierRef = useRef<number>(0);

  const currentPlayer = players[currentPlayerIndex] || { id: 'unknown', name: 'لاعب' };
  const nextPlayerIndex = (currentPlayerIndex + 1) % (players.length || 1);
  const upcomingPlayer = players[nextPlayerIndex];

  // Start boiling loop on mount and stop on unmount
  useEffect(() => {
    sound.startBoiling();
    return () => {
      sound.stopBoiling();
      if (useGameStore.getState().phase !== 'ROUND_ACTIVE') {
        stopRoundTimer();
      }
    };
  }, []);

  // Update boiling sound scaling with tension
  useEffect(() => {
    sound.updateBoiling(tension);

    // Pulse haptics as tension tiers rise (e.g., crossing 30%, 50%, 75%, 90%)
    const currentTier = Math.floor(tension * 5); // 0, 1, 2, 3, 4, 5
    if (currentTier > lastTensionTierRef.current && tension > 0.2) {
      lastTensionTierRef.current = currentTier;
      haptics.tensionPulse(tension);
    }
  }, [tension, sound, haptics]);

  const handlePassTurn = () => {
    sound.play('buttonPress');
    haptics.buttonPress();
    nextPlayer();
  };

  // Tension color calculation (strictly non-numeric visual representation)
  const getTensionColorClass = () => {
    if (tension > 0.8) return 'bg-leb-red';
    if (tension > 0.5) return 'bg-amber-600';
    return 'bg-leb-green';
  };

  return (
    <div id="game-screen" className="w-full flex-1 flex flex-col justify-between items-center gap-3 py-1 overflow-y-auto max-h-full">
      {/* Top Bar: Round Status, Mute Toggle & Exit */}
      <header className="w-full flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-leb-red/10 border border-leb-red/30 text-leb-red text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>الجولة مشتعلة!</span>
          </div>
          <MuteToggle showLabel={false} />
        </div>

        <button
          type="button"
          id="exit-game-btn"
          onClick={() => {
            sound.play('buttonPress');
            resetToSetup();
          }}
          className="min-h-[40px] px-3 py-1 rounded-lg text-xs font-bold text-app-muted hover:text-app-text hover:bg-app-surface-alt transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إنهاء والعودة</span>
        </button>
      </header>

      {/* Tension Placeholder Bar (CRITICAL RULE: STRICTLY NO NUMERIC COUNTDOWN) */}
      <section
        id="tension-bar-container"
        className="w-full max-w-md px-1 flex flex-col gap-1.5"
        aria-label="مستوى التوتر والحرارة"
      >
        <div className="w-full h-3 rounded-full bg-app-surface-alt border border-app-border overflow-hidden p-0.5 shadow-inner">
          <div
            id="tension-fill-bar"
            className={`h-full rounded-full transition-all duration-100 ease-linear ${getTensionColorClass()}`}
            style={{ width: `${Math.min(100, Math.max(3, tension * 100))}%` }}
          />
        </div>
      </section>

      {/* Main Question Card (ONLY question text rendered) */}
      <section
        id="question-card"
        className="w-full p-5 sm:p-6 rounded-3xl bg-app-surface border-2 border-app-border text-center shadow-md flex flex-col items-center justify-center gap-2 min-h-[130px]"
      >
        <span className="text-xs uppercase tracking-wider font-bold text-coffee-700 dark:text-coffee-300">
          تحدي الجولة الحالي
        </span>
        <p
          id="active-question-text"
          className="text-xl sm:text-2xl md:text-3xl font-black text-app-text leading-snug tracking-tight"
        >
          {currentQuestionText || 'سمّي أكلة لبنانية'}
        </p>
      </section>

      {/* Current Active Player Highlight Banner */}
      <section className="w-full flex flex-col items-center gap-1.5">
        <span className="text-xs font-bold text-app-muted">الدور الآن على:</span>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPlayer.id + '-' + currentPlayerIndex}
            initial={{ scale: 0.9, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            id="active-player-banner"
            className="w-full max-w-sm py-4 px-6 rounded-2xl bg-coffee-800 text-cream-base dark:bg-coffee-700 dark:text-cream-100 border-2 border-coffee-600 shadow-lg text-center flex flex-col items-center justify-center gap-1"
          >
            <span className="text-[11px] font-semibold text-cream-muted/80">
              اللاعب {currentPlayerIndex + 1} من {players.length}
            </span>
            <span
              id="active-player-name"
              className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs break-words max-w-full px-2"
            >
              {currentPlayer.name}
            </span>
            {upcomingPlayer && (
              <span className="text-[11px] text-cream-muted/70 font-medium truncate max-w-full px-2">
                التالي: {upcomingPlayer.name}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Main Cute Rakweh Coffee Pot Mascot (Separate from Pass button) */}
      <section className="flex flex-col items-center justify-center my-0.5">
        <CoffeePot
          tension={tension}
          flameOn={true}
          boiledOver={tension >= 1}
        />
      </section>

      {/* Action Controls Footer */}
      <footer className="w-full max-w-md flex flex-col gap-3">
        {/* Pass Button (Separate from the coffee pot button) */}
        <button
          type="button"
          id="pass-turn-btn"
          onClick={handlePassTurn}
          className="min-h-[58px] w-full px-6 py-4 rounded-2xl font-black text-lg sm:text-xl bg-leb-green text-white hover:bg-leb-green-hover active:scale-[0.97] transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer select-none"
          aria-label="مرّر الدور للاعب التالي"
        >
          <span>مرّر الدور</span>
          <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          <span className="text-xs font-bold opacity-90 font-mono">(Pass →)</span>
        </button>

        {/* Secondary: MainButton in ROUND_ACTIVE (Contextual Forfeit Knob with Hold/Tap confirmation) */}
        <MainButton />
      </footer>
    </div>
  );
};

export default GameScreen;

