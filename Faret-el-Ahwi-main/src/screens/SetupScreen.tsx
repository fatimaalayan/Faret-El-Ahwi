import React, { useState, useId } from 'react';
import { useGameStore } from '../engine/gameStore';
import { MIN_PLAYERS, MAX_PLAYERS } from '../config/constants';
import { MuteToggle } from '../components/MuteToggle/MuteToggle';
import { useSound } from '../hooks/useSound';
import { useHaptics } from '../hooks/useHaptics';
import { UserPlus, Trash2, AlertCircle, Play, Users } from 'lucide-react';

export const SetupScreen: React.FC = () => {
  const inputId = useId();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const players = useGameStore((state) => state.players);
  const addPlayer = useGameStore((state) => state.addPlayer);
  const removePlayer = useGameStore((state) => state.removePlayer);
  const updatePlayerName = useGameStore((state) => state.updatePlayerName);
  const goToReady = useGameStore((state) => state.goToReady);

  const sound = useSound();
  const haptics = useHaptics();

  const canAddMore = players.length < MAX_PLAYERS;
  const hasBlankNames = players.some((p) => !p.name.trim());
  const canStart = players.length >= MIN_PLAYERS && !hasBlankNames;

  // Compute duplicates (case-insensitive)
  const nameCounts = players.reduce<Record<string, number>>((acc, p) => {
    const key = p.name.trim().toLowerCase();
    if (key) {
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newPlayerName.trim();

    if (!trimmed) {
      setInputError('يرجى إدخال اسم اللاعب • Name cannot be empty');
      return;
    }

    if (!canAddMore) {
      setInputError(`وصلت للحد الأقصى (${MAX_PLAYERS} لاعبين)`);
      return;
    }

    sound.play('buttonPress');
    haptics.buttonPress();
    addPlayer(trimmed.slice(0, 20));
    setNewPlayerName('');
    setInputError(null);
  };

  return (
    <div id="setup-screen" className="w-full flex-1 flex flex-col justify-between gap-5">
      {/* Top Header Card */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-app-text">
            <Users className="w-5 h-5 text-leb-red" aria-hidden="true" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">إعداد اللاعبين</h2>
          </div>

          <div className="flex items-center gap-2">
            <MuteToggle />

            {/* Player Count Badge: "5 / 3–13 players" */}
            <div
              id="player-count-badge"
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 ${
                canStart
                  ? 'bg-leb-green/10 border-leb-green/40 text-leb-green dark:text-green-400'
                  : 'bg-coffee-100 border-app-border text-app-secondary dark:bg-coffee-800 dark:text-coffee-200'
              }`}
            >
              <span>{players.length} / {MIN_PLAYERS}–{MAX_PLAYERS} لاعبين</span>
              <span className="text-[10px] opacity-75">({players.length} / {MIN_PLAYERS}–{MAX_PLAYERS} players)</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
          أضف من {MIN_PLAYERS} إلى {MAX_PLAYERS} لاعبين لبدء الجولة. يمكنك تعديل الأسماء مباشرة بالضغط عليها.
        </p>
      </section>

      {/* Add Player Input Form */}
      <form onSubmit={handleAddPlayer} className="w-full flex flex-col gap-2">
        <label htmlFor={inputId} className="text-xs font-bold text-app-text flex justify-between items-center">
          <span>اسم اللاعب الجديد • Add Player</span>
          <span className="text-[11px] font-normal text-app-muted">{newPlayerName.length}/20</span>
        </label>

        <div className="flex items-center gap-2">
          <input
            id={inputId}
            type="text"
            value={newPlayerName}
            maxLength={20}
            disabled={!canAddMore}
            onChange={(e) => {
              setNewPlayerName(e.target.value.slice(0, 20));
              if (inputError) setInputError(null);
            }}
            placeholder={canAddMore ? 'مثال: كريم، سارة، زياد...' : 'تم الوصول للحد الأقصى من اللاعبين'}
            className="flex-1 min-h-[48px] px-4 rounded-xl bg-app-surface border-2 border-app-border focus:border-coffee-600 focus:outline-none text-app-text text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-app-muted/60"
          />

          <button
            type="submit"
            id="add-player-btn"
            disabled={!canAddMore || !newPlayerName.trim()}
            className="min-h-[48px] min-w-[48px] sm:min-w-[100px] px-4 rounded-xl bg-coffee-800 text-cream-base font-bold text-sm hover:bg-coffee-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer dark:bg-coffee-700 dark:hover:bg-coffee-600"
            aria-label="إضافة لاعب / Add player"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة</span>
          </button>
        </div>

        {/* Input Validation or Duplicate notice */}
        {inputError && (
          <p className="text-xs text-leb-red flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{inputError}</span>
          </p>
        )}
      </form>

      {/* Players List Container (Scrollable for 13 players) */}
      <section className="flex-1 w-full flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-app-muted font-medium px-1">
          <span>قائمة اللاعبين ({players.length})</span>
          {!canStart && (
            <span className="text-leb-red font-semibold text-[11px]">
              متبقي {MIN_PLAYERS - players.length} لاعبين كحد أدنى للبدء
            </span>
          )}
        </div>

        <div
          id="players-scroll-container"
          className="w-full max-h-[360px] sm:max-h-[420px] overflow-y-auto pr-1 flex flex-col gap-2.5 rounded-2xl bg-app-surface/60 p-2 sm:p-3 border border-app-border"
          tabIndex={0}
          aria-label="قائمة اللاعبين المسجلين"
        >
          {players.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-app-muted">
              <Users className="w-8 h-8 opacity-40 text-coffee-500" />
              <p className="text-sm font-semibold text-app-text">لا يوجد لاعبين حتى الآن</p>
              <p className="text-xs max-w-xs text-app-muted">
                أدخل أسماء اللاعبين المشاركين في الجلسة للبدء في التحدي.
              </p>
            </div>
          ) : (
            players.map((player, index) => {
              const trimmedKey = player.name.trim().toLowerCase();
              const isDuplicate = (nameCounts[trimmedKey] || 0) > 1;

              return (
                <div
                  key={player.id}
                  id={`player-row-${player.id}`}
                  className="w-full min-h-[54px] p-2 sm:p-2.5 rounded-xl bg-app-surface border border-app-border flex items-center justify-between gap-2 shadow-xs transition-all hover:border-app-border-strong"
                >
                  {/* Player Index Number */}
                  <span className="w-7 h-7 rounded-lg bg-app-surface-alt text-app-secondary flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
                    {index + 1}
                  </span>

                  {/* Inline Editable Name Input with character cap */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <input
                      type="text"
                      id={`player-name-input-${player.id}`}
                      value={player.name}
                      maxLength={20}
                      onChange={(e) => {
                        updatePlayerName(player.id, e.target.value.slice(0, 20));
                      }}
                      onBlur={() => {
                        if (!player.name.trim()) {
                          updatePlayerName(player.id, `لاعب ${index + 1}`);
                        }
                      }}
                      placeholder="اسم اللاعب"
                      className="w-full bg-transparent border-b border-transparent focus:border-coffee-500 focus:bg-app-surface-alt/40 px-2 py-1 text-sm font-bold text-app-text focus:outline-none rounded transition-colors"
                      aria-label={`تعديل اسم اللاعب ${index + 1}`}
                    />

                    {/* Inline duplicate flag (does not block) */}
                    {isDuplicate && (
                      <div className="flex items-center gap-1 px-2 text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>اسم مكرر • Duplicate name</span>
                      </div>
                    )}
                  </div>

                  {/* Remove Player Button with large touch target (44px+) */}
                  <button
                    type="button"
                    id={`remove-player-${player.id}`}
                    onClick={() => {
                      sound.play('buttonPress');
                      haptics.buttonPress();
                      removePlayer(player.id);
                    }}
                    className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-app-muted hover:text-leb-red hover:bg-leb-red/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    aria-label={`حذف ${player.name || 'اللاعب'}`}
                    title="حذف اللاعب"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Action / Start Button Footer */}
      <footer className="w-full pt-2 flex flex-col gap-2">
        <button
          type="button"
          id="start-game-btn"
          disabled={!canStart}
          onClick={() => {
            sound.play('buttonPress');
            haptics.buttonPress();
            goToReady();
          }}
          className="min-h-[52px] w-full px-6 py-3.5 rounded-xl font-bold text-base bg-leb-red text-white hover:bg-leb-red-hover active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>المتابعة إلى الاستعداد • Ready</span>
        </button>

        {!canStart && (
          <p className="text-center text-xs text-app-muted">
            {players.length < MIN_PLAYERS
              ? `يجب إضافة ${MIN_PLAYERS - players.length} لاعبين إضافيين على الأقل لتمكين زر البدء.`
              : 'يرجى كتابة أسماء جميع اللاعبين (لا يمكن ترك الاسم فارغاً).'}
          </p>
        )}
      </footer>
    </div>
  );
};

export default SetupScreen;
