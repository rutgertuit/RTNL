import type { Metadata } from "next";
import "@/styles/win95.css";

export const metadata: Metadata = {
  title: "Agent Inclusive Sim",
};

// Wraps the agent-game route in the .win95-scope class. The CSS module is
// imported only here, so the rest of the site keeps its dark RTNL theme.
export default function AgentGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="win95-scope">{children}</div>;
}
