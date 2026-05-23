/**
 * Anecdotal Hook — the Conceptual-Swing moment between Hero and EditorialColumn.
 * Server component (no hooks).
 */
export function AnecdotalHook() {
  return (
    <section className="rt-hook" aria-labelledby="hook-title">
      <div className="rt-hook__transit-in" aria-hidden />
      <div className="container">
        <div className="rt-hook__inner">
          <div className="rt-hook__brow">
            <span className="rt-hook__brow-num">01</span>
            <span className="eyebrow eyebrow--warm">WHAT&apos;S HERE</span>
            <span className="eyebrow">RUTGER TUIT · 2026</span>
          </div>
          <p className="rt-hook__pull" id="hook-title">
            Three articles, six side projects, one homelab — <em>the work I keep coming back to</em>
            with the agencies and brand teams I sit across from.
          </p>
          <p className="rt-hook__body">
            None of it is finished. All of it is up for discussion. Drop a note if any of it is
            useful, broken, or worth arguing about.
          </p>
          <div className="rt-hook__signature">
            <span className="rt-hook__sig-line" aria-hidden />
            <span className="rt-hook__sig-text">Rutger Tuit · Rotterdam · May 2026</span>
          </div>
        </div>
      </div>
      <div className="rt-hook__transit-out" aria-hidden />
    </section>
  );
}
