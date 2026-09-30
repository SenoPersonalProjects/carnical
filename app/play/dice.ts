export type RolledDie = { value: number; hunger: boolean; previousValue?: number };
export type RollRecord = {
  id: string; kind: "test" | "rouse"; label: string; pool: number; hunger: number;
  difficulty: number; dice: RolledDie[]; successes: number; outcome: string;
  createdAt: string; margin?: number; rerolled?: boolean;
};

export function rollPool(pool: number, hunger: number, random = Math.random): RolledDie[] {
  const count = Math.max(1, Math.min(30, Math.trunc(pool) || 1));
  const hungry = Math.max(0, Math.min(count, 5, Math.trunc(hunger) || 0));
  return Array.from({ length: count }, (_, index) => ({ value: Math.floor(random() * 10) + 1, hunger: index < hungry }));
}

export function evaluateTest(dice: RolledDie[], difficulty: number) {
  const base = dice.filter(die => die.value >= 6).length;
  const pairs = Math.floor(dice.filter(die => die.value === 10).length / 2);
  const bonus = pairs * 2;
  const successes = base + bonus;
  const passed = successes >= difficulty;
  const messy = passed && pairs > 0 && dice.some(die => die.hunger && die.value === 10);
  const bestial = !passed && dice.some(die => die.hunger && die.value === 1);
  const type = messy ? "messy" : bestial ? "bestial" : passed && pairs > 0 ? "critical" : passed ? "success" : "failure";
  const outcome = { messy: "Crítico bestial", bestial: "Falha bestial", critical: "Sucesso crítico", success: "Sucesso", failure: "Falha" }[type];
  return { successes, margin: successes - difficulty, outcome, type, base, pairs, bonus };
}

export function rerollDice(dice: RolledDie[], indices: number[], random = Math.random) {
  const chosen = new Set(indices);
  if (chosen.size < 1 || chosen.size > 3 || [...chosen].some(index => !Number.isInteger(index) || !dice[index] || dice[index].hunger)) return null;
  return dice.map((die, index) => chosen.has(index) ? { ...die, previousValue: die.value, value: Math.floor(random() * 10) + 1 } : die);
}

export function resolveRouseCheck(hunger: number, value: number) {
  const success = value >= 6;
  return {
    hunger: success ? hunger : Math.min(5, hunger + 1),
    successes: success ? 1 : 0,
    outcome: success ? "Sucesso — Fome não aumenta" : hunger >= 5 ? "Falha — Fome já está em 5" : "Falha — Fome +1",
  };
}
