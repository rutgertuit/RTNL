"use client";

// ProjectionContext — provides a hoverable "what would happen if I did X and
// ended the turn" preview. Phase 5c.2: thin wrapper around projectAction (5c.1)
// exposed via React context so HUD tiles, action buttons, and desks can all
// subscribe to the same projected state without prop drilling.
//
// Hover a button → useMemo recomputes projected state via projectAction.
// Mouse-leave / blur → action cleared, projected becomes null.
// Action rejected by reducer → projectAction returns caller state unchanged,
// so onlyLogChanged() filter keeps `projected === state`. We treat that as
// "no preview" by comparing in consumers (they only render a ghost when
// projected differs from current).

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { GameState } from "./cards";
import type { Action } from "./reducer";
import { projectAction } from "./projection";

interface ProjectionContextValue {
  projected: GameState | null;
  hover(action: Action | null): void;
}

const Ctx = createContext<ProjectionContextValue | null>(null);

export function ProjectionProvider({
  state,
  children,
}: {
  state: GameState;
  children: ReactNode;
}) {
  const [action, setAction] = useState<Action | null>(null);
  const projected = useMemo(
    () => (action ? projectAction(state, action) : null),
    [state, action],
  );
  return <Ctx.Provider value={{ projected, hover: setAction }}>{children}</Ctx.Provider>;
}

export function useProjection(): ProjectionContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProjection used outside ProjectionProvider");
  return v;
}

/**
 * Render-prop bridge — lets a JSX subtree access projection hover/projected
 * without each leaf needing its own `useProjection()` call. Used by
 * AgentGameClient to scope `hover`/`projected` into the existing inline JSX
 * without refactoring it into separate components.
 */
export function ProjectionConsumer({
  children,
}: {
  children: (value: ProjectionContextValue) => ReactNode;
}) {
  const v = useProjection();
  return <>{children(v)}</>;
}
