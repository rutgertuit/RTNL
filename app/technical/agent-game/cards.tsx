export interface Employee {
  id: string;
  name: string;
  type: "human" | "agent"; // homelab cortex node employee connection
  promotionLevel: 1 | 2 | 3;
  experience: number; // turns worked
  loyalty: number; // 0 to 100
  hasPDP: boolean;
  inspirationTurnsLeft: number;
  isAsleep: boolean;
  turnsOnboarded: number;
  pptPoisoningTurns: number;
  traitId?: string; // unique passive trait ID
}

export interface EmployeeTrait {
  id: string;
  displayName: string;
  passiveName: string;
  description: string;
  spirit: string;
}

export const TRAIT_DATABASE: Record<string, EmployeeTrait> = {
  rump: {
    id: "rump",
    displayName: "Ronald Rump",
    passiveName: "Trump Card",
    description: "+50% salary, but doubles the productivity multiplier boost of OKRs.",
    spirit: "Wants to build a wall around the kantoortuin. Very high energy. Tremendous OKRs, the best.",
  },
  husk: {
    id: "husk",
    displayName: "Melon Husk",
    passiveName: "Chief Twit",
    description: "AI upgrades yield double productivity leverage, but suffers 2x base loyalty decay.",
    spirit: "Obsessed with homelab clusters. Will fire Jochem over email to save tokens. Needs constant inspiration.",
  },
  zweistein: {
    id: "zweistein",
    displayName: "Dilbert Zweistein",
    passiveName: "Patent Office",
    description: "Onboarding time is halved, and gains a permanent +20% base productivity multiplier.",
    spirit: "Thinks in 4D space-time dimensions. Thinks standard documentation is just a projection of reality.",
  },
  patcher: {
    id: "patcher",
    displayName: "Margaret Patcher",
    passiveName: "Iron Lady",
    description: "Ironclad. Loyalty cannot drop below 1% (never resigns from low satisfaction). Inspires no one during promotions.",
    spirit: "Firm hand. Thinks kantoortuin is too soft. Will privatize Jochem's coffee apparatus if cash falls.",
  },
  shift: {
    id: "shift",
    displayName: "Taylor Shift",
    passiveName: "Pop Era",
    description: "Promotions instantly boost all other active human employees' loyalty by +8%.",
    spirit: "Brings musical energy to meetings. Edgar is a big fan of her OKR redefinition tour.",
  },
  furie: {
    id: "furie",
    displayName: "Marie Furie",
    passiveName: "Radical Energy",
    description: "Restores +15 loyalty to herself upon sleeping, and has a +20% base productivity multiplier.",
    spirit: "Her presence is glowing (literally). Discovered compliance radium isotopes in Edgar's powerpoints.",
  },
  perkel: {
    id: "perkel",
    displayName: "Angela Perkel",
    passiveName: "Mutti Rules",
    description: "Permanent assets (lobby, coffee, garden) maintenance costs are halved when she is active.",
    spirit: "Quietly coordinates the European office. Pragmatic documentation lover. Prefers potato soup over bitterballen.",
  },
};

export interface CorporateEvent {
  id: string;
  title: string;
  description: string;
  optionALabel: string;
  optionBLabel: string;
  optionAFlavor: string;
  optionBFlavor: string;
}

export const EVENT_DATABASE: Record<string, CorporateEvent> = {
  kpmg_audit: {
    id: "kpmg_audit",
    title: "⚠️ KPMG Compliance Scrutiny",
    description: "Amstelveen auditors have arrived. They noticed undocumented homelab Hermes nodes running cURL loops to San Francisco.",
    optionALabel: "Pay Settlement ($30,000)",
    optionBLabel: "Accept Scrutiny (-15 Loyalty)",
    optionAFlavor: "You pay out a compliance settlement to clear the record.",
    optionBFlavor: "You accept auditing. Humans lose 15 loyalty due to integration meeting stress.",
  },
  rto_mandate: {
    id: "rto_mandate",
    title: "🏢 Return to Office Mandate",
    description: "The Board demands workers return to their seats to foster 'tribal synergy'.",
    optionALabel: "Enforce strictly (+25% Prod, -20 Loyalty)",
    optionBLabel: "Hybrid Allowance (-$15,000 Cash, +10 Loyalty)",
    optionAFlavor: "You mandate 5 days in the office. Productivity spikes but morale collapses.",
    optionBFlavor: "You offer hybrid subsidies, costing cash but boosting loyalty.",
  },
  headcount_freeze: {
    id: "headcount_freeze",
    title: "🧊 Headcount Freeze Order",
    description: "A sudden budget crunch forces the Board of Directors to demand hiring freezes.",
    optionALabel: "Freeze Hiring (Gain $25,000, Hire Locked)",
    optionBLabel: "Defy Board (-10 P/E Multiplier for 3t)",
    optionAFlavor: "You freeze hires. The Board pays you a cash bonus, but hiring options are disabled next turn.",
    optionBFlavor: "You ignore them. Corporate valuation suffers a -10x P/E penalty from boardroom anger.",
  },
  kroket_shortage: {
    id: "kroket_shortage",
    title: "🍔 FEBO Kroket Supply Shortage",
    description: "A national kroket transport strike hits. The FEBO lobby walls stand completely empty.",
    optionALabel: "Import Bitterballen (-$10,000 Cash)",
    optionBLabel: "Let Them Starve (-15 Loyalty)",
    optionAFlavor: "You pay a premium to import alternative bitterballen from Brabant.",
    optionBFlavor: "You ignore it. Loyalty drops globally as workers search for kroketten.",
  },
  homelab_surge: {
    id: "homelab_surge",
    title: "⚡ homelab Cortex Power Surge",
    description: "A massive voltage surge spikes your hermes cluster, accelerating AI Agent runtimes.",
    optionALabel: "Overclock Nodes (+50% Agent Prod, -$20,000 Cash)",
    optionBLabel: "Throttling (-30% Agent Prod, +10 human Loyalty)",
    optionAFlavor: "You run agents hot. They generate massive revenue, but burn $20,000 in motherboard fees.",
    optionBFlavor: "You throttle them. AI slows down, giving human teammates peace of mind.",
  },
};

export interface Card {
  id: string;
  name: string;
  flavor: string;
  cost: number;
  requiresTarget: boolean;
  class: "documentation" | "pdp" | "perk" | "synergy";
  rulesText: string;
}

export interface GameState {
  version: 1; // schema version guard
  difficulty: "boardroom" | "reality" | "zirp";
  turn: number;
  cash: number;
  valuation: number;
  okrLevel: number; // 0 to 5
  agentVersion: number; // 0 to 6
  employees: Employee[];
  cardsHand: string[];
  cardsDeck: string[];
  cardsDiscard: string[];
  eventLog: string[];
  hasDocumentation: boolean;
  hasKroketLobby: boolean; // camelCase
  hasKoffieApparaat: boolean; // camelCase
  kantoortuinPenaltyTurns: number;
  redefinedOkrsThisTurn: boolean;
  hypeTurnsLeft: number;
  isGameOver: boolean;
  gameResult: "win" | "lose" | null;
  activeEventId: string | null;
  draftChoices: string[] | null;
  freezeHiringNextTurn?: boolean;
  boardAngerTurns?: number;
  rtoActiveTurns?: number;
  surgeTurnsLeft?: number;
  surgeThrottledTurnsLeft?: number;
  // Progressive-disclosure tutorial state.
  // tutorialDismissed: list of turn numbers where the player closed the banner.
  // promotionsThisTurn: enforces the "one promotion per turn" rule introduced
  // in the turn-3 tutorial. Resets to 0 in END_TURN.
  tutorialDismissed?: number[];
  promotionsThisTurn?: number;
  // One-action-per-bucket-per-turn caps. Force the player to make a
  // strategic choice each turn instead of buying everything on turn 1.
  // Reset in END_TURN. (redefinedOkrsThisTurn already does double duty.)
  hiredThisTurn?: boolean;
  playedCardThisTurn?: boolean;
  // Cash delta tracking: prevCash is captured at the START of END_TURN so the
  // HUD can show "▲ / ▼ $Xk" under the cash tile after each turn resolves.
  prevCash?: number;
}

// ============================================================
// Card Database Definitions
// ============================================================
export const CARD_DATABASE: Record<string, Card> = {
  markdown_wiki: {
    id: "markdown_wiki",
    name: "Markdown Wiki",
    flavor: "Lous, zet de KPI's gewoon in een platte .md file. Geen opsmuk. En stuur Edgar weg met z'n PowerPoint.",
    cost: 15000,
    requiresTarget: false,
    class: "documentation",
    rulesText: "Enables Documentation. Halves employee onboarding time (from 6 turns to 3). Mitigates future AI compliance audits.",
  },
  pdp: {
    id: "pdp",
    name: "Build-Plan PDP",
    flavor: "We moeten Edgar parametriseren. Zonder build-plan gaat 'ie zweven, Jochem.",
    cost: 5000,
    requiresTarget: true,
    class: "pdp",
    rulesText: "Grants Build-Plan PDP to a worker, allowing them to be promoted safely without productivity and loyalty penalties.",
  },
  kroket_lunch: {
    id: "kroket_lunch",
    name: "Broodje Kroket Lunch",
    flavor: "Heerlijk, twee kroketten uit de muur. Wel ff aftekenen op de kostenplaats van Debiteuren/Crediteuren.",
    cost: 2500,
    requiresTarget: true,
    class: "perk",
    rulesText: "Restores +35 Loyalty to a worker, but they fall asleep ('tapped') for 1 turn (0% productivity).",
  },
  hei_sessie: {
    id: "hei_sessie",
    name: "Drentse Hei-sessie",
    flavor: "We gaan met z'n allen op een hunebed zitten om de synergie te voelen. Neuzen dezelfde kant op!",
    cost: 12000,
    requiresTarget: true,
    class: "synergy",
    rulesText: "Inspires a worker for 5 turns (+50% productivity), who then inspires everyone at a lower promotion level. Grants them +20 Loyalty.",
  },
  kantoortuin: {
    id: "kantoortuin",
    name: "Kantoortuin Herinrichting",
    flavor: "Iedereen aan één grote houten tafel, Edgar. Dat stimuleert de informele interactie.",
    cost: 20000,
    requiresTarget: false,
    class: "perk",
    rulesText: "Restores +15 Loyalty to all active workers, but causes distraction: -10% global productivity for 2 turns.",
  },
  gpt5_wrapper: {
    id: "gpt5_wrapper",
    name: "GPT-5 API Wrapper",
    flavor: "We noemen het 'Enterprise Cognitive Layer', maar het is gewoon een cURL script naar San Francisco.",
    cost: 35000,
    requiresTarget: false,
    class: "synergy",
    rulesText: "Instantly upgrades AI Agent version by 1. If Documentation is active, increases P/E multiplier by +5x. If not, triggers immediate Token Leakage.",
  },
  kroket_lobby: {
    id: "kroket_lobby",
    name: "Kroket-lobby Febo",
    flavor: "De Febo-wand naast de receptie is de beste investering sinds de reorganisatie van '94.",
    cost: 25000,
    requiresTarget: false,
    class: "perk",
    rulesText: "Permanent asset. Automatically restores +2 Loyalty to all workers at the end of each turn.",
  },
  vage_okr: {
    id: "vage_okr",
    name: "Vage OKR Sessie",
    flavor: "We sturen niet meer op omzet, Jochem. We sturen op 'holistische klantbeleving in het kwadraat'.",
    cost: 10000,
    requiresTarget: false,
    class: "synergy",
    rulesText: "Increases OKR Level by 1 (max 5). Triggers immediate alignment meeting: -40% productivity this turn.",
  },
  auditor: {
    id: "auditor",
    name: "Amstelveense Auditor",
    flavor: "De accountants van KPMG willen de logs zien. Gelukkig hebben we alles in git staan.",
    cost: 15000,
    requiresTarget: false,
    class: "documentation",
    rulesText: "Clears any active Token Leakage cash penalties. Requires Documentation to play.",
  },
  powerpoint_clinic: {
    id: "powerpoint_clinic",
    name: "Edgar's PPT Clinic",
    flavor: "Kijk naar deze transitie, Lous. De kogelpunten vliegen er zo van links in. Prachtig.",
    cost: 8000,
    requiresTarget: true,
    class: "perk",
    rulesText: "Grants +40 Loyalty to target, but inflicts PowerPoint poisoning: -20% productivity for 3 turns.",
  },
  koffie_apparaat: {
    id: "koffie_apparaat",
    name: "Jochem's Koffie-apparaat",
    flavor: "Espresso, macchiato, ristretto... het kost een kwartier per bakje, maar de synergie trilt door je lijf.",
    cost: 15000,
    requiresTarget: false,
    class: "perk",
    rulesText: "Permanent asset. Increases employee base productivity by +10% permanently. Maintenance costs $1,000/turn.",
  },
};

// ============================================================
// SVG Vector Artwork Helper Functions
// ============================================================
export function renderCardArt(cardId: string): React.ReactNode {
  const props = {
    width: "40",
    height: "40",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
  };

  switch (cardId) {
    case "markdown_wiki":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8M16 17H8M10 9H8" />
        </svg>
      );
    case "pdp":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" strokeDasharray="3 3" />
        </svg>
      );
    case "kroket_lunch":
      return (
        <svg {...props}>
          <rect x="3" y="11" width="18" height="8" rx="2" />
          <path d="M6 11V8a3 3 0 016 0v3M12 11V7a3 3 0 016 0v4" />
          <circle cx="9" cy="15" r="1" fill="currentColor" />
          <circle cx="15" cy="15" r="1" fill="currentColor" />
        </svg>
      );
    case "hei_sessie":
      return (
        <svg {...props}>
          <path d="M12 2L2 22h20L12 2z" />
          <path d="M12 6l-6 12h12L12 6z" />
          <circle cx="12" cy="13" r="2" />
        </svg>
      );
    case "kantoortuin":
      return (
        <svg {...props}>
          <rect x="2" y="2" width="20" height="20" rx="2" />
          <path d="M2 12h20M12 2v20" />
          <circle cx="7" cy="7" r="2" />
          <circle cx="17" cy="7" r="2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case "gpt5_wrapper":
      return (
        <svg {...props}>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          <circle cx="12" cy="12" r="3" strokeWidth={2} />
        </svg>
      );
    case "kroket_lobby":
      return (
        <svg {...props}>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M4 8h16M4 14h16" />
          <rect x="7" y="4" width="3" height="2" />
          <rect x="14" y="4" width="3" height="2" />
        </svg>
      );
    case "vage_okr":
      return (
        <svg {...props}>
          <circle cx="9" cy="12" r="6" />
          <circle cx="15" cy="12" r="6" />
          <path d="M12 6v12" strokeDasharray="2 2" />
        </svg>
      );
    case "auditor":
      return (
        <svg {...props}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      );
    case "powerpoint_clinic":
      return (
        <svg {...props}>
          <path d="M3 3h18v12H3zM12 15v4M9 21h6" />
        </svg>
      );
    case "koffie_apparaat":
      return (
        <svg {...props}>
          <path d="M18 8h2a2 2 0 012 2v2a2 2 0 01-2 2h-2M2 14h16v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6z" />
          <path d="M6 2v3M10 2v3" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

export function renderEmployeeArt(type: "human" | "agent"): React.ReactNode {
  if (type === "agent") {
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
        <rect x={3} y={3} width={18} height={18} rx={2} />
        <path d="M12 8v8M8 12h8" />
        <circle cx={12} cy={12} r={2} fill="currentColor" />
        <path d="M6 6h2v2H6zm10 0h2v2h-2zM6 16h2v2H6zm10 0h2v2h-2z" strokeDasharray="1 1" />
      </svg>
    );
  }

  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx={12} cy={7} r={4} />
      <path d="M2 4l3 3M22 4l-3 3" strokeDasharray="1 1" />
    </svg>
  );
}
