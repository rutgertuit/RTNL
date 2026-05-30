import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "Clout Cannon";
const TAGLINE = "A LinkedIn content factory, in four rooms.";
const DESCRIPTION =
  "Clout Cannon is an AI-powered content factory for LinkedIn. Raw ideas, URLs, and notes enter as 'ingredients', AI bundles related ingredients, and the post moves through four distinct rooms — Supply Room, Writer Camp, Art Department, World — before being scheduled and published. Built on .NET 8 + React 19 + Gemini, with a 'Chaos Canvas' neon cyberpunk design system. Backend on Cloud Run, frontend on Firebase Hosting, data in Firestore.";

const REPO_URL = "https://github.com/rutgertuit/Social_Tool";
const LIVE_URL = "https://rutger-social.web.app";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article" },
  robots: { index: true, follow: true },
};

const ld = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TechArticle",
      "@id": "https://rutgertuit.nl/technical/clout-cannon#article",
      headline: TITLE,
      description: DESCRIPTION,
      url: "https://rutgertuit.nl/technical/clout-cannon",
      author: { "@id": "https://rutgertuit.nl/#person" },
      inLanguage: "en",
      proficiencyLevel: "Expert",
      about: { "@id": "https://rutgertuit.nl/technical/clout-cannon#repo" },
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": "https://rutgertuit.nl/technical/clout-cannon#repo",
      name: "Clout Cannon",
      description: DESCRIPTION,
      codeRepository: REPO_URL,
      programmingLanguage: ["C#", "TypeScript", "JavaScript"],
      runtimePlatform: "Google Cloud Run + Firebase Hosting",
      author: { "@id": "https://rutgertuit.nl/#person" },
      applicationCategory: "ContentProductionPlatform",
      operatingSystem: "Cloud (containerised)",
    },
  ],
};

interface Room {
  emoji: string;
  name: string;
  job: string;
  what: string;
}
const ROOMS: Room[] = [
  {
    emoji: "📦",
    name: "Supply Room",
    job: "Ingredient collection + bundling",
    what: "Drop in URLs, text notes, images. Gemini bundles related ingredients automatically. Ingredients are reusable — one source clip can seed multiple posts. Visual indicators show used vs unused.",
  },
  {
    emoji: "✍️",
    name: "Writer Camp",
    job: "AI writing + editing",
    what: "Auto-generates a post from the chosen ingredients using your Writing Vibe. Six editing tools (longer / shorter / more professional / more casual / fix typos / add humor). Twelve writing personas via the Archetype Intervention modal. Real-time AI feedback + quality scoring.",
  },
  {
    emoji: "🎨",
    name: "Art Department",
    job: "Visual content generation",
    what: "Six visual archetypes (3 illustrations + 3 photography styles). Gemini image generation conditioned on brand guidelines stored in the AI Brain. Skip-to-World or attach generated images to the post.",
  },
  {
    emoji: "🌍",
    name: "World",
    job: "Schedule + publish",
    what: "Schedule posts for LinkedIn. Published-post management, engagement tracking, real-time analytics. Cloud Function carries the actual LinkedIn API integration.",
  },
];

interface VisualArchetype {
  emoji: string;
  name: string;
  bucket: "Illustration" | "Photography";
  note: string;
}
const VISUAL_ARCHETYPES: VisualArchetype[] = [
  {
    emoji: "🧑‍🎨",
    name: "Corporate Memphis",
    bucket: "Illustration",
    note: "The cartoon style: flat vectors, bright colours, disproportionate limbs, minimal facial features. The dominant LinkedIn-illustration default.",
  },
  {
    emoji: "💡",
    name: "Conceptual Editorial",
    bucket: "Illustration",
    note: "Visual metaphor / allegory for complex ideas. Textured, nuanced palettes. The NYT-op-ed register.",
  },
  {
    emoji: "⚡",
    name: "Surrealism / Brutalism",
    bucket: "Illustration",
    note: "Reality mixed with dreamlike elements. Raw shapes, anti-design, illogical compositions.",
  },
  {
    emoji: "👥",
    name: "Authentic & Candid",
    bucket: "Photography",
    note: "Anti-stock. Unscripted moments, real emotions, natural light in real work environments.",
  },
  {
    emoji: "♟️",
    name: "High-Concept Metaphorical",
    bucket: "Photography",
    note: "Objects as symbols. Staged, clean, minimalist. Chess pieces = strategy, lightbulbs = ideas.",
  },
  {
    emoji: "🌈",
    name: "Creative Abstract",
    bucket: "Photography",
    note: "Non-representational. No recognisable subjects — form, colour, line, texture, motion.",
  },
];

interface StackRow {
  layer: string;
  detail: string;
}
const STACK: StackRow[] = [
  {
    layer: "Backend API",
    detail: ".NET 8 (Ecp.Api). Controllers per room — IngredientsController, PostsController, ArtDepartmentController, WorkflowController, BrandGuidelinesController.",
  },
  {
    layer: "Domain models",
    detail: "Ecp.Application. Ingredient, IngredientBundle, Post (with room tracking), AIArtist (visual archetype defs), BrandGuidelines.",
  },
  {
    layer: "Frontend",
    detail: "React 19 + TypeScript (ecp-frontend). One page per room (SupplyRoomPage, EditingRoomPage, ArtDepartmentPage, ThePublicPage). Material Symbols icons, Space Grotesk typography.",
  },
  {
    layer: "AI models",
    detail: "Gemini 3 Flash for text generation + bundle suggestions, Gemini 3.1 Flash Image for the Art Department.",
  },
  {
    layer: "Data",
    detail: "Firestore — real-time updates so room transitions surface immediately across surfaces.",
  },
  {
    layer: "Hosting",
    detail: "Cloud Run (europe-west1) for the .NET API. Firebase Hosting (rutger-social.web.app) for the React frontend. Cloud Function for the LinkedIn publish step.",
  },
  {
    layer: "CI/CD",
    detail: "git push origin main → Cloud Build → Cloud Run for backend. npm run build → firebase deploy for frontend.",
  },
];

interface DesignChoice {
  title: string;
  body: string;
}
const DESIGN_CHOICES: DesignChoice[] = [
  {
    title: "The factory metaphor is load-bearing",
    body: "Each room is a distinct stage with distinct affordances. A post can't be 'almost in two rooms at once'. Room transitions are explicit, the Post model carries the room as state, and the navigation shows you which room you're in. The constraint is the feature.",
  },
  {
    title: "Ingredients are reusable",
    body: "The same source clip can seed multiple posts. The Supply Room tracks used vs unused. Bundle suggestions include reused ingredients so a long-running ingredient (a great quote, a chart) keeps earning.",
  },
  {
    title: "The AI Brain is a configuration layer, not a model layer",
    body: "Brand guidelines, voice calibration, archetype preferences all live in one Brain panel accessible from any room. The models call the Brain for their context; the Brain isn't called from inside any single room's logic. Re-tuning the brand once re-tunes every output.",
  },
  {
    title: "Chaos Canvas is the design language",
    body: "Neon cyberpunk register — electric blue / hot pink / neon green per room theme, glitch text, scanlines, neon-glow buttons. A deliberate contrast with the LinkedIn-default Corporate Memphis aesthetic the tool itself can produce. The tool looks loud so the output can look quiet.",
  },
  {
    title: "GitHub-push deploys, not gcloud commands",
    body: "Backend deploys are strictly via git push → Cloud Build → Cloud Run. No manual gcloud run deploy. This isn't a preference — it's the contract the deployment pipeline is built around, and bypassing it breaks it.",
  },
];

export default function CloutCannonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Breadcrumb
        trail={[
          { label: "Home", href: "/" },
          { label: "Technical / Deep End", href: "/#technical" },
          { label: "Clout Cannon" },
        ]}
      />
      <article className="rt-tuit rt-techwrite section section--surface">
        <div className="container">
          <header className="rt-techwrite__head">
            <div className="eyebrow eyebrow--warm">
              D · 03 · TECHNICAL WRITE-UP
            </div>
            <h1 className="rt-tuit__title">{TITLE}.</h1>
            <p className="rt-techwrite__tagline">{TAGLINE}</p>
            <p className="rt-tuit__lead">
              Ideas in, polished LinkedIn posts out. Each post moves
              through four rooms — Supply, Writer Camp, Art Department,
              World — with AI assistance at every stage and a central
              Brain that keeps brand voice + visual style consistent
              across them.
            </p>
            <ul className="rt-techwrite__meta">
              <li>
                <span className="eyebrow">REPO</span>{" "}
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  github.com/rutgertuit/Social_Tool →
                </a>
              </li>
              <li>
                <span className="eyebrow">LIVE</span>{" "}
                <a href={LIVE_URL} target="_blank" rel="noopener noreferrer">
                  rutger-social.web.app →
                </a>
              </li>
              <li>
                <span className="eyebrow">RUNTIME</span> Cloud Run
                (europe-west1) + Firebase Hosting
              </li>
              <li>
                <span className="eyebrow">STATUS</span> Open · personal
                project · v1.3 live
              </li>
            </ul>
          </header>

          <section className="rt-techwrite__section">
            <div className="eyebrow">01 · THE FOUR ROOMS</div>
            <h2>One workflow, four explicit stages.</h2>
            <p>
              Posts can only be in one room at a time. Each room has its
              own affordances, its own AI tools, and its own visual
              theme. The factory metaphor is the architecture, not a
              decoration.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Job</th>
                    <th>What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {ROOMS.map((r) => (
                    <tr key={r.name}>
                      <td>
                        <strong>
                          {r.emoji} {r.name}
                        </strong>
                      </td>
                      <td>{r.job}</td>
                      <td>{r.what}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">02 · THE AI BRAIN</div>
            <h2>One configuration layer, six rooms&apos; worth of effect.</h2>
            <p>
              The Brain panel is accessible from any room via Brain
              Settings. It holds two tabs today (a third on the
              roadmap):
            </p>
            <ul className="rt-techwrite__stack">
              <li>
                <strong>Illustrator</strong> — brand guidelines builder
                (colours, visual style, composition, mood, typography),
                AI style inference (upload images / docs / URLs for
                Gemini to analyse), view/edit mode with edit protection,
                six visual archetypes.
              </li>
              <li>
                <strong>Writer</strong> — writing style calibration,
                voice consistency training, tone preferences, example
                post analysis. Coming next.
              </li>
              <li>
                <strong>Archetype Intervention</strong> — twelve writing
                personas surfaced as a modal from Writer Camp when a
                post needs a sharper voice.
              </li>
            </ul>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">03 · VISUAL ARCHETYPES</div>
            <h2>Six. Three illustrations, three photography styles.</h2>
            <p>
              The Art Department doesn&apos;t generate visuals on a
              blank slate — every output is conditioned on one of six
              archetypes. Naming the register up front makes the result
              actually usable. The three illustration styles map cleanly
              to a Corporate / Editorial / Anti-design axis; the three
              photo styles map to the same axis in a different medium.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Archetype</th>
                    <th>Bucket</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {VISUAL_ARCHETYPES.map((a) => (
                    <tr key={a.name}>
                      <td>
                        <strong>
                          {a.emoji} {a.name}
                        </strong>
                      </td>
                      <td>{a.bucket}</td>
                      <td>{a.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">04 · NOTABLE DESIGN CHOICES</div>
            <h2>The non-obvious decisions.</h2>
            <dl className="rt-techwrite__choices">
              {DESIGN_CHOICES.map((c) => (
                <div key={c.title}>
                  <dt>{c.title}</dt>
                  <dd>{c.body}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">05 · STACK</div>
            <h2>What runs underneath.</h2>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Layer</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {STACK.map((s) => (
                    <tr key={s.layer}>
                      <td>
                        <strong>{s.layer}</strong>
                      </td>
                      <td>{s.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section rt-techwrite__section--closer">
            <div className="eyebrow eyebrow--warm">WHY THIS EXISTS</div>
            <p>
              The honest version: writing a good LinkedIn post takes
              real effort, and most tooling solves the wrong half of the
              problem — scheduling, analytics, performative cadence
              tracking. Clout Cannon tries to solve the part that
              actually matters: turning an interesting input into a
              piece of writing that&apos;s honest about its register,
              paired with a visual that&apos;s honest about its
              archetype. Same{" "}
              <Link href="/technical/luminary">
                separate-the-engine-from-the-prompt
              </Link>{" "}
              instinct as the rest of the stack — the four rooms are
              the engine; the Brain is the configuration the engine
              reads.
            </p>
            <p className="rt-techwrite__signoff">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rt-techwrite__cta"
              >
                Read the source on GitHub →
              </a>
            </p>
          </section>
        </div>
      </article>
      <Footer />
      <AppChrome />
    </>
  );
}
