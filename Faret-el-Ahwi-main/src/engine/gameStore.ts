import { create } from 'zustand';
import { getRandomQuestion, RECENT_HISTORY_SIZE } from './questionEngine';
import { getRandomRoundDuration, startRoundTimer, stopRoundTimer } from './timerEngine';

export type GamePhase = 'SETUP' | 'RULES' | 'READY' | 'ROUND_ACTIVE' | 'ROUND_END';
export type EndReason = 'timeout' | 'forfeit' | null;

export interface Player {
  id: string;
  name: string;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  currentQuestionId: number | null;
  currentQuestionText: string | null;
  recentQuestionIds: number[];
  tension: number;
  loserId: string | null;
  endReason: EndReason;
  muted: boolean;

  // Actions
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayerName: (id: string, name: string) => void;
  drawNextQuestion: () => void;
  goToReady: () => void;
  startGame: () => void;
  forfeitRound: () => void;
  nextPlayer: () => void;
  endRound: (loserId?: string, reason?: 'timeout' | 'forfeit') => void;
  resetToSetup: () => void;
}

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'p_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

// Stored internally; never exposed as raw seconds state to UI
let internalRoundDurationSeconds: number | null = null;

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'SETUP',
  players: [],
  currentPlayerIndex: 0,
  currentQuestionId: null,
  currentQuestionText: null,
  recentQuestionIds: [],
  tension: 0,
  loserId: null,
  endReason: null,
  muted: typeof localStorage !== 'undefined' ? localStorage.getItem('zaka_muted') === 'true' : false,

  setMuted: (muted: boolean) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('zaka_muted', String(muted));
    }
    set({ muted });
  },

  toggleMuted: () => {
    const nextMuted = !get().muted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('zaka_muted', String(nextMuted));
    }
    set({ muted: nextMuted });
  },

  addPlayer: (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state) => {
      if (state.players.length >= 13) return state;
      return {
        players: [...state.players, { id: generateId(), name: trimmed }],
      };
    });
  },

  removePlayer: (id: string) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    }));
  },

  updatePlayerName: (id: string, name: string) => {
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, name } : p)),
    }));
  },

  drawNextQuestion: () => {
    set((state) => {
      const question = getRandomQuestion(state.recentQuestionIds);
      const updatedRecent = [...state.recentQuestionIds, question.id].slice(-RECENT_HISTORY_SIZE);
      return {
        currentQuestionId: question.id,
        currentQuestionText: question.question,
        recentQuestionIds: updatedRecent,
      };
    });
  },

  goToReady: () => {
    stopRoundTimer();
    set((state) => {
      if (state.players.length < 3) return state;
      // Sanitize players: trim whitespace, ensure no blank names
      const sanitized = state.players.map((p, idx) => ({
        ...p,
        name: p.name.trim() || `لاعب ${idx + 1}`,
      }));
      return {
        players: sanitized,
        phase: 'READY',
      };
    });
  },

  startGame: () => {
    // Exactly one timer active at a time: stop previous timer
    stopRoundTimer();

    const currentState = get();
    if (currentState.players.length < 3) return;
    if (currentState.phase === 'ROUND_ACTIVE') return;

    // Sanitize any empty/whitespace player names
    const sanitizedPlayers = currentState.players.map((p, idx) => ({
      ...p,
      name: p.name.trim() || `لاعب ${idx + 1}`,
    }));

    // Pick a random starting player index
    const startIndex = Math.floor(Math.random() * sanitizedPlayers.length);
    // Pick an initial question
    const question = getRandomQuestion(currentState.recentQuestionIds);
    const updatedRecent = [...currentState.recentQuestionIds, question.id].slice(-RECENT_HISTORY_SIZE);

    // Roll duration once and store internally (never expose raw seconds to UI)
    const rolledDuration = getRandomRoundDuration(sanitizedPlayers.length);
    internalRoundDurationSeconds = rolledDuration;

    set({
      players: sanitizedPlayers,
      phase: 'ROUND_ACTIVE',
      currentPlayerIndex: startIndex,
      currentQuestionId: question.id,
      currentQuestionText: question.question,
      recentQuestionIds: updatedRecent,
      loserId: null,
      endReason: null,
      tension: 0,
    });

    // Start single interval tick mechanism updating tension from 0 to 1 over duration
    startRoundTimer(
      rolledDuration,
      (tensionProgress) => {
        const state = get();
        if (state.phase !== 'ROUND_ACTIVE') return;
        set({ tension: tensionProgress });
      },
      () => {
        // When tension reaches 1: automatically call endRound(loserId = currentPlayerIndex's id, reason: 'timeout')
        const state = get();
        if (state.phase === 'ROUND_ACTIVE') {
          const timeoutLoserId = state.players[state.currentPlayerIndex]?.id ?? null;
          get().endRound(timeoutLoserId || undefined, 'timeout');
        }
      }
    );
  },

  forfeitRound: () => {
    const state = get();
    if (state.phase !== 'ROUND_ACTIVE') return;
    const forfeitLoserId = state.players[state.currentPlayerIndex]?.id ?? null;
    get().endRound(forfeitLoserId || undefined, 'forfeit');
  },

  nextPlayer: () => {
    set((state) => {
      if (state.phase !== 'ROUND_ACTIVE') return state;
      if (state.players.length === 0) return state;
      // Advances currentPlayerIndex circularly. Does NOT change question.
      const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
      return {
        currentPlayerIndex: nextIndex,
      };
    });
  },

  // Idempotent: safe to call twice without double-triggering
  endRound: (loserId?: string, reason: 'timeout' | 'forfeit' = 'timeout') => {
    stopRoundTimer();
    set((state) => {
      if (state.phase === 'ROUND_END') {
        return state;
      }
      const resolvedLoserId = loserId || (state.players[state.currentPlayerIndex]?.id ?? null);
      return {
        phase: 'ROUND_END',
        tension: 1,
        loserId: resolvedLoserId,
        endReason: reason,
      };
    });
  },

  resetToSetup: () => {
    stopRoundTimer();
    internalRoundDurationSeconds = null;
    set({
      phase: 'SETUP',
      currentQuestionId: null,
      currentQuestionText: null,
      recentQuestionIds: [],
      currentPlayerIndex: 0,
      tension: 0,
      loserId: null,
      endReason: null,
    });
  },
}));
