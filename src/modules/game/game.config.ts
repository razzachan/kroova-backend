export const GAME_CONSTANTS = {
  DECK_SIZE: 20,
  INITIAL_HAND: 3,
  WIN_THRESHOLD: 7, // glórias necessárias para vencer
  DRAW_PER_ROUND: 1,
};

export type DuelAttribute = 'influencia' | 'impacto' | 'raridade';

export interface CardSnapshot {
  id: string;
  influencia: number;
  impacto: number; // valor econômico/liquidez
  raridade: number; // escala essencial 0-100
}

export interface RoundResult {
  winner: 'A' | 'B' | 'collapse';
  attribute: DuelAttribute;
  reason: string;
}