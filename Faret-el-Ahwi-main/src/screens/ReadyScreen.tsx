import React from 'react';
import { useGameStore } from '../engine/gameStore';
import { MainButton } from '../components/MainButton/MainButton';
import { CoffeePot } from '../components/CoffeePot/CoffeePot';
import { MuteToggle } from '../components/MuteToggle/MuteToggle';
import { useSound } from '../hooks/useSound';
import { useHaptics } from '../hooks/useHaptics';
import { Users, ArrowRight } from 'lucide-react';

export const ReadyScreen: React.FC = () => {
  const players = useGameStore((state) => state.players);
  const resetToSetup = useGameStore((state) => state.resetToSetup);

  const sound = useSound();
  const haptics = useHaptics();

  return (
    <div id="ready-screen" className="w-full flex-1 flex flex-col justify-between items-center text-center gap-4 py-2">
      {/* Top Header */}
      <header className="w-full flex flex-col items-center gap-2 max-w-sm">
        <div className="w-full flex items-center justify-between px-1">
          <span className="text-xs font-bold text-app-muted">تجهيز الجولة • Ready</span>
          <MuteToggle />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-coffee-800 dark:text-coffee-100 tracking-tight">
          الجميع جاهز للتحدي؟
        </h1>
        <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
          تم تجهيز {players.length} لاعبين. سيتم اختيار اللاعب الأول وسحب السؤال عشوائياً.
        </p>
      </header>

      {/* Idle Coffee Pot Mascot */}
      <div className="flex flex-col items-center justify-center my-0.5">
        <CoffeePot tension={0} flameOn={false} boiledOver={false} />
      </div>

      {/* Players Preview List */}
      <section
        id="ready-players-roster"
        className="w-full max-w-md p-3 rounded-2xl bg-app-surface border border-app-border flex flex-col gap-2 shadow-xs"
      >
        <div className="flex items-center justify-between text-xs font-bold text-app-muted px-1">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-coffee-600" />
            <span>اللاعبون المشاركون</span>
          </span>
          <span className="font-mono bg-app-surface-alt px-2 py-0.5 rounded-md text-[11px] text-app-text">
            {players.length} لاعبين
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 justify-center max-h-32 overflow-y-auto p-1">
          {players.map((player, idx) => (
            <span
              key={player.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-app-surface-alt border border-app-border text-xs font-bold text-app-text"
            >
              <span className="w-4 h-4 rounded-full bg-coffee-200 text-coffee-800 dark:bg-coffee-700 dark:text-coffee-200 text-[10px] flex items-center justify-center font-mono font-bold">
                {idx + 1}
              </span>
              <span className="truncate max-w-[130px]">{player.name}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Action Buttons */}
      <footer className="w-full max-w-md flex flex-col gap-2.5">
        {/* Contextual MainButton (READY -> Start) */}
        <MainButton />

        <button
          type="button"
          id="back-to-setup-btn"
          onClick={() => {
            sound.play('buttonPress');
            haptics.buttonPress();
            resetToSetup();
          }}
          className="min-h-[44px] w-full px-4 py-2 rounded-xl font-bold text-xs bg-app-surface border-2 border-app-border text-app-muted hover:text-app-text hover:bg-app-surface-alt active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>تعديل قائمة اللاعبين • Edit Players</span>
        </button>
      </footer>
    </div>
  );
};

export default ReadyScreen;
