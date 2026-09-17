export interface TimerRange {
  minPlayers: number;
  maxPlayers: number;
  minSeconds: number;
  maxSeconds: number;
}

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 13;

export const TIMER_RANGES: readonly TimerRange[] = [
  { minPlayers: 3, maxPlayers: 4, minSeconds: 20, maxSeconds: 35 },
  { minPlayers: 5, maxPlayers: 7, minSeconds: 30, maxSeconds: 45 },
  { minPlayers: 8, maxPlayers: 10, minSeconds: 40, maxSeconds: 60 },
  { minPlayers: 11, maxPlayers: 13, minSeconds: 50, maxSeconds: 75 },
];
