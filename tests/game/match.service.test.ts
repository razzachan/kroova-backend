import { describe, it, expect } from 'vitest';
import { MatchService } from '../../src/modules/game/match.service.js';

function card(id: string, influencia: number, impacto: number, raridade: number) {
  return { id, influencia, impacto, raridade };
}

describe('MatchService', () => {
  it('increments glory until win threshold 7', () => {
    const m = new MatchService();
    for (let i = 0; i < 7; i++) {
      const res = m.playRound('influencia', card('A'+i, 10+i, 1, 1), card('B'+i, 0, 1, 1));
      expect(res.winner).toBe('A');
    }
    expect(m.isFinished()).toBe(true);
    expect(m.winner()).toBe('A');
  });

  it('handles collapse on full tie', () => {
    const m = new MatchService();
    const res = m.playRound('raridade', card('A', 5, 5, 10), card('B', 5, 5, 10));
    expect(res.winner).toBe('collapse');
    expect(m.score.A).toBe(0);
    expect(m.score.B).toBe(0);
  });
});