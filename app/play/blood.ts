import { resolveRouseCheck } from "./dice";

// Renegade: BloodPotencyTable.pdf (Companion / Guia do Jogador, p. 248).
export const BLOOD_POTENCY = [
  [1, 1], [2, 1], [2, 2], [3, 2], [3, 3], [4, 3],
  [4, 3], [5, 3], [5, 4], [6, 4], [6, 5],
] as const;
export function bloodBenefits(potency: number) {
  const [surge, mend] = BLOOD_POTENCY[Math.max(0, Math.min(10, Math.trunc(potency) || 0))];
  return { surge, mend };
}
export type BloodSession = {
  night: number; turn: number; lastMendTurn: number | null;
  lastAggravatedNight: number | null; aggravatedNights: number[];
  torpor: boolean;
};
export function bloodSession(value: Partial<BloodSession> | undefined): BloodSession {
  return { night: 0, turn: 0, lastMendTurn: null, lastAggravatedNight: null,
    aggravatedNights: [], torpor: false, ...value };
}
export function eligibleAggravated(session: BloodSession) {
  return !session.torpor && session.lastAggravatedNight !== session.night &&
    session.aggravatedNights.some(night => night < session.night);
}
export function mendSuperficial(session: BloodSession, damage: number, hunger: number, potency: number, die: number) {
  if (session.torpor || hunger >= 5 || damage <= 0 || session.lastMendTurn === session.turn) return null;
  const check = resolveRouseCheck(hunger, die);
  return { damage: Math.max(0, damage - bloodBenefits(potency).mend), hunger: check.hunger,
    session: { ...session, lastMendTurn: session.turn }, check };
}
export function recoverAggravated(session: BloodSession, hunger: number, dice: number[]) {
  if (!eligibleAggravated(session) || dice.length !== 3) return null;
  const checks: ReturnType<typeof resolveRouseCheck>[] = [];
  let currentHunger = hunger;
  for (const die of dice) {
    const check = resolveRouseCheck(currentHunger, die, "mandatory");
    checks.push(check); currentHunger = check.hunger;
    if (check.torpor) break;
  }
  const torpor = checks.some(check => check.torpor);
  const nights = [...session.aggravatedNights];
  if (!torpor) nights.splice(nights.findIndex(night => night < session.night), 1);
  return { hunger: currentHunger, healed: !torpor, checks,
    session: { ...session, lastAggravatedNight: session.night, aggravatedNights: nights, torpor } };
}
export function advanceNight(session: BloodSession, hunger: number, die: number) {
  if (session.torpor) return null;
  const check = resolveRouseCheck(hunger, die, "mandatory");
  return { hunger: check.hunger, check,
    session: { ...session, night: session.night + 1, turn: session.turn + 1, torpor: check.torpor } };
}
