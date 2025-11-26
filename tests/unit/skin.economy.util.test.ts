import { describe, it, expect } from 'vitest';
import { computeAdjustedLiquidity, enforcePriceFloor } from '../../src/modules/skin/skin.economy.util';
import { getEditionConfig } from '../../src/config/edition';

describe('skin.economy.util', () => {
  const edition = getEditionConfig('ED01');
  it('aplica multiplicador correto (neon = x2)', () => {
    const liq = computeAdjustedLiquidity(10, 'neon', 'ED01');
    expect(liq).toBe(20);
  });
  it('aplica multiplicador default = 1', () => {
    const liq = computeAdjustedLiquidity(10, 'default', 'ED01');
    expect(liq).toBe(10);
  });
  it('rejeita preço abaixo do piso', () => {
    const res = enforcePriceFloor(15, 10, 'neon', 'ED01'); // piso = 20
    expect(res.ok).toBe(false);
    expect(res.floor).toBe(20);
  });
  it('aceita preço >= piso', () => {
    const res = enforcePriceFloor(22, 10, 'neon', 'ED01');
    expect(res.ok).toBe(true);
  });
});