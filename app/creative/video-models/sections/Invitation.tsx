import Link from "next/link";

export function Invitation() {
  return (
    <section
      className="rt-bi__section rt-bi-invite"
      data-bi-section="invitation"
      id="invitation"
    >
      <div className="rt-bi__eyebrow">INVITATION · WHAT TO DO WITH THIS</div>
      <h2 className="rt-bi__heading">The brief, on Thursday.</h2>

      <p className="rt-bi__body">
        The version of this conversation that happens in your office on
        Thursday isn&apos;t about resolution. It&apos;s about which
        vendor&apos;s roadmap survives 2027.
      </p>
      <p className="rt-bi__body">
        Here&apos;s the heuristic I keep coming back to. When a
        generative-video vendor pitches you, ask two questions.{" "}
        <strong>First:</strong> how many words is the brief that produces
        their best-case demo? If it&apos;s still 200 words of stage direction,
        you&apos;re looking at last-generation architecture in fresh marketing
        wrap. <strong>Second:</strong> how does the per-second compute cost
        trend across their tier line? If their <em>Lite</em> tier is
        approaching parity with their <em>Premium</em> tier on output quality,
        they&apos;ve found the architecture that scales. If it isn&apos;t,
        they&apos;re going to lose to a competitor who has.
      </p>
      <p className="rt-bi__body">
        Neither of those is on a vendor&apos;s spec sheet. Both of them are
        sitting in plain sight in any demo a vendor will gladly give you. The
        shrinking brief and the flattening cost curve are the two leading
        indicators. Resolution numbers are a lagging indicator at best.
      </p>

      <blockquote className="rt-bi-invite__pull">
        <p>
          <strong>The shift isn&apos;t the model. It&apos;s the contract.</strong>
        </p>
        <p>
          <em>Between director and renderer. Between brief and output.
          Between vendor and buyer.</em>
        </p>
      </blockquote>

      <Link
        className="rt-bi-invite__crosslink"
        href="/business/multiplier-myth"
      >
        <span className="rt-bi-invite__crosslink-label">
          RELATED READING
        </span>
        <h3>The Multiplier Myth.</h3>
        <p>
          The boardroom mistake that turns a multiplier into a margin-chop
          also turns a creative-AI roadmap into a procurement cliff.
          Different vocabulary, same shape.
        </p>
        <span className="rt-bi-invite__crosslink-cta">
          Read the article <span aria-hidden>→</span>
        </span>
      </Link>

      <p className="rt-bi-invite__signoff">
        <em>
          If you&apos;re working on a serious version of this question inside
          your own organisation, the drop-me-a-line invitation from the
          business articles applies here too. I won&apos;t pitch you anything.
          I&apos;d just like to know what&apos;s actually working.
        </em>
      </p>

      <nav className="rt-bi-invite__nav" aria-label="Article navigation">
        <Link className="button" href="/#creative">
          <span aria-hidden>←</span> Back to creative
        </Link>
        <Link className="button button--warm" href="/contact">
          Tell me what you&apos;re building <span aria-hidden>→</span>
        </Link>
      </nav>
    </section>
  );
}
