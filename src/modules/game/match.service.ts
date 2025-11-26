import { GAME_CONSTANTS, CardSnapshot, DuelAttribute, RoundResult } from './game.config.js';

export class MatchService {
  private gloryA = 0;
  private gloryB = 0;
  private round = 0;

  get score() {
    return { A: this.gloryA, B: this.gloryB, round: this.round };
  }

  isFinished() {
    return this.gloryA >= GAME_CONSTANTS.WIN_THRESHOLD || this.gloryB >= GAME_CONSTANTS.WIN_THRESHOLD;
  }

  winner() {
    if (this.gloryA >= GAME_CONSTANTS.WIN_THRESHOLD) return 'A';
    if (this.gloryB >= GAME_CONSTANTS.WIN_THRESHOLD) return 'B';
    return null;
  }

  playRound(attribute: DuelAttribute, cardA: CardSnapshot, cardB: CardSnapshot): RoundResult {
    if (this.isFinished()) {
      throw new Error('Match already finished');
    }
    this.round++;
    let winner: 'A' | 'B' | 'collapse';
    let reason = '';
    const valueA = this.extract(attribute, cardA);
    const valueB = this.extract(attribute, cardB);
    if (valueA > valueB) {
      winner = 'A';
      reason = `${attribute} maior (${valueA} > ${valueB})`;
    } else if (valueB > valueA) {
      winner = 'B';
      reason = `${attribute} maior (${valueB} > ${valueA})`;
    } else { // empate principal -> desempates
      const tieAInflu = cardA.influencia;
      const tieBInflu = cardB.influencia;
      if (tieAInflu > tieBInflu) {
        winner = 'A';
        reason = 'desempate por influência';
      } else if (tieBInflu > tieAInflu) {
        winner = 'B';
        reason = 'desempate por influência';
      } else {
        const tieAEcon = cardA.impacto;
        const tieBEcon = cardB.impacto;
        if (tieAEcon > tieBEcon) {
          winner = 'A';
          reason = 'desempate por impacto econômico';
        } else if (tieBEcon > tieAEcon) {
          winner = 'B';
          reason = 'desempate por impacto econômico';
        } else {
          winner = 'collapse';
          reason = 'colapso — forças iguais';
        }
      }
    }
    if (winner === 'A') this.gloryA++;
    if (winner === 'B') this.gloryB++;
    return { winner, attribute, reason };
  }

  private extract(attr: DuelAttribute, card: CardSnapshot) {
    switch (attr) {
      case 'influencia': return card.influencia;
      case 'impacto': return card.impacto;
      case 'raridade': return card.raridade;
    }
  }
}