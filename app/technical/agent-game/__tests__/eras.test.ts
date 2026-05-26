import { describe, expect, it } from "vitest";
import { eraOfTurn, cardsForEra, isPreAi, isAi, ERA_HANDOFF_TURN } from "../eras";
import { CARD_DATABASE } from "../cards";

describe("eras", () => {
  it("turns 1-5 are pre-AI", () => {
    for (let t = 1; t <= 5; t++) expect(eraOfTurn(t)).toBe("pre-ai");
  });

  it("turns 6+ are AI", () => {
    for (let t = 6; t <= 30; t++) expect(eraOfTurn(t)).toBe("ai");
  });

  it("ERA_HANDOFF_TURN is 6", () => {
    expect(ERA_HANDOFF_TURN).toBe(6);
  });

  it("isPreAi / isAi helpers", () => {
    expect(isPreAi(3)).toBe(true);
    expect(isAi(6)).toBe(true);
  });

  it("cardsForEra(pre-ai) excludes AI-only cards", () => {
    const cards = cardsForEra("pre-ai");
    expect(cards).not.toContain("markdown_wiki");
    expect(cards).not.toContain("gpt5_wrapper");
    expect(cards).not.toContain("auditor");
  });

  it("cardsForEra(pre-ai) includes the 6 new pre-AI cards", () => {
    const cards = cardsForEra("pre-ai");
    expect(cards).toContain("ordner_archief");
    expect(cards).toContain("vrijdagmiddagborrel");
    expect(cards).toContain("iso_9001");
    expect(cards).toContain("senior_partner");
    expect(cards).toContain("brainstorm_in_sauna");
    expect(cards).toContain("faxmodernisering");
  });

  it("cardsForEra(ai) includes all AI cards + shared cards", () => {
    const cards = cardsForEra("ai");
    expect(cards).toContain("markdown_wiki");
    expect(cards).toContain("gpt5_wrapper");
    expect(cards).toContain("auditor");
    expect(cards).toContain("hei_sessie");
  });

  it("every card in DB has an era field", () => {
    for (const card of Object.values(CARD_DATABASE)) {
      expect(["pre-ai", "ai", "shared"]).toContain(card.era);
    }
  });
});
