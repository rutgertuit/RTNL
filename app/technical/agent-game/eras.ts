import { CARD_DATABASE } from "./cards";

export const ERA_HANDOFF_TURN = 6;

export type Era = "pre-ai" | "ai";

export function eraOfTurn(turn: number): Era {
  return turn < ERA_HANDOFF_TURN ? "pre-ai" : "ai";
}

export const isPreAi = (turn: number): boolean => eraOfTurn(turn) === "pre-ai";
export const isAi = (turn: number): boolean => eraOfTurn(turn) === "ai";

export function cardsForEra(era: Era): string[] {
  return Object.values(CARD_DATABASE)
    .filter((c) => c.era === "shared" || c.era === era)
    .map((c) => c.id);
}
