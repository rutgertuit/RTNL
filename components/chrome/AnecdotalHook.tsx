/**
 * Anecdotal Hook — the Conceptual-Swing moment between Hero and EditorialColumn.
 * Server component (no hooks).
 */
export function AnecdotalHook() {
  return (
    <section id="hook" className="rt-hook" aria-labelledby="hook-title">
      <div className="rt-hook__transit-in" aria-hidden />
      <div className="container">
        <div className="rt-hook__inner">
          <div className="rt-hook__brow">
            <span className="eyebrow eyebrow--warm">WHAT&apos;S ON THIS SITE</span>
            <span className="eyebrow">RUTGER TUIT · 2026</span>
          </div>
          <p className="rt-hook__pull" id="hook-title">
            Side-line learnings worth sharing &mdash; from my own AI experiments, the day job, and
            the networks I sit in. Notes on creative AI in <em>music, video, and games.</em> And a
            log of the technical projects running in the homelab.
          </p>
          <p className="rt-hook__body">
            None of it is finished. All of it is up for discussion. Drop a note if any of it is
            useful, broken, or worth arguing about.
          </p>
          <div className="rt-hook__signature">
            <span className="rt-hook__sig-line" aria-hidden />
            <span className="rt-hook__sig-text">Rutger Tuit · Amsterdam · May 2026</span>
          </div>
        </div>
      </div>
      <div className="rt-hook__transit-out" aria-hidden />
    </section>
  );
}
