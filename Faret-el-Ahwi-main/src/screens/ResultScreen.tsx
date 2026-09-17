import React, { useEffect } from 'react';
import { useGameStore } from '../engine/gameStore';
import { MainButton } from '../components/MainButton/MainButton';
import { CoffeePot } from '../components/CoffeePot/CoffeePot';
import { MuteToggle } from '../components/MuteToggle/MuteToggle';
import { useSound } from '../hooks/useSound';
import { useHaptics } from '../hooks/useHaptics';
import { motion } from 'motion/react';
import { Flame, Flag, Play, HelpCircle, UserX, Sparkles } from 'lucide-react';

export const ResultScreen: React.FC = () => {
  const players = useGameStore((state) => state.players);
  const loserId = useGameStore((state) => state.loserId);
  const endReason = useGameStore((state) => state.endReason);
  const currentQuestionText = useGameStore((state) => state.currentQuestionText);
  const startGame = useGameStore((state) => state.startGame);

  const sound = useSound();
  const haptics = useHaptics();

  // Exactly one loser resolved cleanly
  const loser = players.find((p) => p.id === loserId) || 
                players[0] || 
                { id: 'unknown', name: 'اللاعب' };

  const isForfeit = endReason === 'forfeit';

  // Sound and haptic triggers on mount with clean timer cancellation
  useEffect(() => {
    let stingTimer: ReturnType<typeof setTimeout> | null = null;

    if (isForfeit) {
      sound.play('roundLossSting');
      haptics.loss();
    } else {
      // Timeout: overflow splash first, followed by dramatic sting
      sound.play('coffeeOverflow');
      haptics.overflow();

      stingTimer = setTimeout(() => {
        sound.play('roundLossSting');
        haptics.loss();
      }, 400);
    }

    return () => {
      if (stingTimer) clearTimeout(stingTimer);
    };
  }, [isForfeit, sound, haptics]);

  const handleQuickRematch = () => {
    sound.play('buttonPress');
    sound.play('fireIgnition');
    haptics.buttonPress();
    startGame();
  };

  return (
    <div
      id="result-screen"
      className="w-full flex-1 flex flex-col justify-between items-center text-center gap-4 py-2 select-none"
    >
      {/* Top Header Bar: Outcome Badge & Mute Toggle */}
      <header className="w-full flex flex-col items-center gap-2 max-w-sm">
        <div className="w-full flex items-center justify-between px-1">
          <div
            id="result-reason-badge"
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isForfeit
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                : 'bg-leb-red/10 border-leb-red/30 text-leb-red'
            }`}
          >
            {isForfeit ? (
              <>
                <Flag className="w-3.5 h-3.5 fill-current" />
                <span>استسلام تكتيكي • Forfeit</span>
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                <span>فوران القهوة • Boiled Over</span>
              </>
            )}
          </div>

          <MuteToggle />
        </div>

        {/* Humorous Title & Commentary */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-1 px-2"
        >
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-coffee-900 dark:text-coffee-50">
            {isForfeit ? 'رفع الراية البيضاء!' : 'فارت الركوة ونفد الوقت!'}
          </h1>
          <p className="text-xs sm:text-sm text-app-muted leading-relaxed max-w-xs">
            {isForfeit
              ? 'فضّل السلامة وصَب الفنجان بنفسه! حركة ذكية بس راحت عليك الجولة.'
              : 'القهوة طافت على الغاز وطلعت ريحتها! الوقت غدرك والركوة ما رحمتك.'}
          </p>
        </motion.div>
      </header>

      {/* Mascot Aftermath State (Reused CoffeePot component) */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex flex-col items-center justify-center my-0.5"
      >
        <CoffeePot
          tension={1}
          flameOn={false}
          boiledOver={!isForfeit}
        />
      </motion.div>

      {/* Prominent Loser Reveal Card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        id="result-loser-card"
        className="w-full max-w-md p-4 sm:p-5 rounded-2xl bg-app-surface border-2 border-leb-red/40 flex flex-col items-center justify-center gap-2.5 shadow-md relative overflow-hidden"
      >
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-leb-red/5 rounded-bl-full pointer-events-none" />

        <div className="flex items-center gap-1.5 text-xs font-bold text-app-muted">
          <UserX className="w-4 h-4 text-leb-red" />
          <span>الخاسر في هذه الجولة:</span>
        </div>

        {/* Big Highlighted Name */}
        <div className="w-full py-2 px-4 rounded-xl bg-leb-red/10 border border-leb-red/20 flex items-center justify-center gap-2">
          <span className="text-2xl sm:text-3xl font-black text-leb-red tracking-tight break-words">
            {loser.name}
          </span>
          <span className="text-xl" role="img" aria-label="defeat">
            {isForfeit ? '🏳️' : '☕'}
          </span>
        </div>

        {/* Question That Stumped the Player */}
        {currentQuestionText && (
          <div className="mt-1 pt-2.5 border-t border-app-border w-full flex flex-col items-center gap-1 text-center">
            <span className="text-[11px] font-bold text-app-muted flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-coffee-600" />
              <span>السؤال اللي ورّطك:</span>
            </span>
            <p className="text-sm font-extrabold text-app-text max-w-xs leading-snug">
              "{currentQuestionText}"
            </p>
          </div>
        )}
      </motion.section>

      {/* Action Controls Footer */}
      <footer className="w-full max-w-md flex flex-col gap-2.5 pt-1">
        {/* MainButton: " العب لعبة جديدة (New Game)" calling resetToSetup() */}
        <MainButton />

        {/* Quick Rematch with Same Roster */}
        <button
          type="button"
          id="quick-rematch-btn"
          onClick={handleQuickRematch}
          className="min-h-[46px] w-full px-4 py-2 rounded-xl font-bold text-xs bg-app-surface border-2 border-app-border text-app-muted hover:text-app-text hover:bg-app-surface-alt active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Play className="w-4 h-4 fill-current text-leb-green" />
          <span>جولة جديدة مباشرة بنفس اللاعبين • Quick Rematch</span>
        </button>
      </footer>
    </div>
  );
};

export default ResultScreen;
