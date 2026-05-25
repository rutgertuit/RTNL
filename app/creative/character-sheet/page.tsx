import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "How to build a character sheet";
const DESCRIPTION =
  "Three ways to build a consistent AI character sheet, in order of effort — Google Flow's Use Character feature, a manual reference-shot pipeline, and training a Flux1D LoRA. With the tradeoffs honestly named. The portrait series cycling in the hero of this site was built using method two.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article" },
};

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "@id": "https://rutgertuit.nl/creative/character-sheet#howto",
  name: TITLE,
  description: DESCRIPTION,
  author: { "@id": "https://rutgertuit.nl/#person" },
  inLanguage: "en",
  totalTime: "PT3H",
  tool: [
    { "@type": "HowToTool", name: "Google Flow (Use Character feature)" },
    { "@type": "HowToTool", name: "Nano Banana / Midjourney / Imagen 3 (reference-image conditioning)" },
    { "@type": "HowToTool", name: "Flux1D + ComfyUI / Forge / Replicate LoRA trainer" },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Method 01 — Google Flow's Use Character feature",
      text:
        "Fastest path, lowest control. Inside Flow, enable Use Character, upload one or two reference images, add a one-line description, and Flow conditions every subsequent shot in the project on that character. Ten minutes end to end; mild drift increases as scene complexity goes up.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Method 02 — Reference-shot pipeline, manually composited",
      text:
        "Most control, moderate effort. Pick one anchor reference image. Use reference-conditioned generation (Midjourney --cref, Nano Banana reference attach, Imagen 3 character mode) to generate four to eight variants per angle. Cherry-pick the best of each. Composite the picks into a single multi-panel sheet. Two to four hours per character; produces a portable sheet usable across tools.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Method 03 — Train a Flux1D LoRA",
      text:
        "Highest consistency, largest upfront cost. Gather 15-30+ clean images of the character, caption each one describing everything except the character itself, train on RunPod / Vast.ai / Replicate / local 24GB+ GPU with 1500-3000 steps at learning rate 1e-4 to 4e-4. One to two weekends the first time; produces a portable character LoRA that costs nothing per generation thereafter.",
    },
  ],
};

export default function CharacterSheetPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      <Nav />
      <Breadcrumb trail={[
        { label: "Home", href: "/" },
        { label: "Creative", href: "/#creative" },
        { label: "Character Sheet" },
      ]} />
      <article className="rt-tuit section section--surface">
        <div className="container">
          <div className="rt-tuit__head">
            <div className="eyebrow eyebrow--warm">
              CREATIVE · TUTORIAL · CHARACTER SHEETS
            </div>
            <h1 className="rt-tuit__title">How to build a character sheet.</h1>
            <div className="rt-tuit__meta">
              <span>10 MIN READ</span>
              <span>·</span>
              <span>PUBLISHED MAY 2026</span>
              <span>·</span>
              <span>FILED UNDER CREATIVE · IMAGE</span>
            </div>
          </div>

          {/* Intro */}
          <div className="rt-tuit__stage">
            <h2 className="rt-tuit__stage-marker">
              <span className="rt-tuit__stage-num">·</span>
              <span className="rt-tuit__stage-label">What it is</span>
            </h2>
            <div className="rt-tuit__stage-body">
              <p className="lead">
                A character sheet is a small set of reference images of the same person — front,
                three-quarter, profile, full body, two expressions — that you feed to an image
                model as the &quot;this is the character&quot; anchor.
              </p>
              <p>
                Without one, every prompt generates a slightly different person. With one, you can
                drop the same character into a hundred scenes and keep them recognisable. It is
                the single highest-leverage piece of preparation in any AI image workflow that
                involves a recurring person — a brand persona, a graphic novel protagonist, a
                spokesperson, yourself.
              </p>
              <p>
                I built mine because I needed the portrait series cycling in the hero of this site
                to feel like the same person across six wildly different moods (studio, warehouse,
                cinematic, profile, mid-shot, stage). Before the sheet, every regeneration was a
                slightly different bald man. After the sheet, the system finally understood there
                was one <em>specific</em> bald man.
              </p>
              <p>
                There are three ways to build one. I&apos;ll walk you through them in order of
                effort, with the tradeoffs honestly named, so you can pick the one that fits the
                size of the problem you actually have.
              </p>
            </div>
          </div>

          {/* Method 01 */}
          <div className="rt-tuit__stage">
            <h2 className="rt-tuit__stage-marker">
              <span className="rt-tuit__stage-num">01</span>
              <span className="rt-tuit__stage-label">Google Flow · Use Character</span>
            </h2>
            <div className="rt-tuit__stage-body">
              <p>
                <strong>Fastest path. Lowest control.</strong> When to use it: you&apos;re inside
                Flow already, you need consistency across a single video sequence or storyboard,
                and you can live with mild drift between shots.
              </p>
              <p>
                <strong>How it works.</strong> Open Flow, start a new project, enable the{" "}
                <em>Use Character</em> feature in the scene setup. Upload one or two reference
                images — front-facing, clean even lighting, no heavy shadows. Add a short text
                description (&quot;bald man, mid-40s, light stubble, dark streetwear, no
                jewellery&quot;). Generate. Flow conditions every subsequent shot in that project
                on the reference.
              </p>
              <p>
                <strong>Tradeoffs.</strong>
              </p>
              <ul>
                <li>
                  <em>Pro:</em> Ten minutes end to end. No model files, no compositing, no
                  command line, no dataset prep. The character travels automatically through every
                  shot in the project.
                </li>
                <li>
                  <em>Con:</em> Confined to Flow&apos;s pipeline — the character does not export
                  cleanly to other tools. Drift increases as scene complexity grows: hair
                  texture, eye colour, jaw shape will wobble across longer sequences. There is
                  no way to fine-tune.
                </li>
              </ul>
              <p>
                <strong>Best for:</strong> storyboards, mood reels, pitch decks — anything where
                the character only needs to read as &quot;the same person, roughly&quot; rather
                than &quot;the same person, exactly.&quot;
              </p>
            </div>
          </div>

          {/* Method 02 */}
          <div className="rt-tuit__stage">
            <h2 className="rt-tuit__stage-marker">
              <span className="rt-tuit__stage-num">02</span>
              <span className="rt-tuit__stage-label">Reference-shot pipeline, manually composited</span>
            </h2>
            <div className="rt-tuit__stage-body">
              <p>
                <strong>Most control. Moderate effort.</strong> When to use it: you want maximum
                control over which &quot;version&quot; of the character becomes canonical, and you
                want a sheet that is portable across multiple tools (Midjourney <code>--cref</code>
                , Nano Banana reference-attach, Imagen 3 character mode, Flux ControlNet, etc.).
              </p>
              <p>
                <strong>This is the method I used for the portrait series on this site.</strong>{" "}
                The six images cycling in the hero are the output. The character sheet that
                anchors them is the input.
              </p>
              <p>
                <strong>How it works.</strong>
              </p>
              <ol>
                <li>
                  <strong>Pick one anchor reference.</strong> Start with one image that you
                  genuinely like — sharp focus, even lighting, neutral expression, three-quarter
                  face is usually safest. Everything that follows is conditioned on this one
                  image, so it has to be good. Spend an hour on this step alone.
                </li>
                <li>
                  <strong>Enumerate the angles you need.</strong> A minimal sheet is six panels:
                  front portrait, three-quarter left, three-quarter right, full profile,
                  three-quarter body shot, plus one or two expression variants. A richer sheet
                  adds a back-of-head shot and a low-angle hero shot.
                </li>
                <li>
                  <strong>Generate each angle with reference conditioning.</strong> In Midjourney
                  that is <code>--cref [your image URL] --cw 100</code>. In Nano Banana it is the
                  reference-attach feature. In Imagen 3 it is character mode. Generate four to
                  eight variants per angle.
                </li>
                <li>
                  <strong>Cherry-pick.</strong> For each angle, choose the variant where the face
                  matches the anchor most cleanly — same jaw, same eye spacing, same nose ridge.
                  This is the slow part and it matters. You are training your own eye to spot
                  drift.
                </li>
                <li>
                  <strong>Composite.</strong> Drop the picks into a single sheet image in
                  Photoshop, Affinity, Figma, or GIMP. A clean 2×4 or 3×3 grid is enough. Label
                  each panel with the angle name.
                </li>
                <li>
                  <strong>Use the sheet as your new reference.</strong> You now have a portable
                  character. Attach the sheet (or a single panel from it) as the reference image
                  in any new generation, in any tool.
                </li>
              </ol>
              <p>
                <strong>Tradeoffs.</strong>
              </p>
              <ul>
                <li>
                  <em>Pro:</em> You control every panel. You can mix tools per angle — Nano
                  Banana might nail your front shots while Midjourney nails the profile. The
                  resulting sheet is portable across any tool that accepts a reference image,
                  including ones that don&apos;t exist yet.
                </li>
                <li>
                  <em>Con:</em> Two to four hours per character. Requires basic compositing
                  skill. Output quality is entirely a function of the source reference, so pick
                  the anchor carefully — a mediocre anchor produces a mediocre sheet no matter
                  how good the downstream generations are.
                </li>
              </ul>
              <p>
                <strong>Best for:</strong> brand work, personal sites, anything where the
                character will appear dozens of times and consistency matters more than the
                evening it took to build the sheet.
              </p>
            </div>
          </div>

          {/* Method 03 */}
          <div className="rt-tuit__stage">
            <h2 className="rt-tuit__stage-marker">
              <span className="rt-tuit__stage-num">03</span>
              <span className="rt-tuit__stage-label">Train a Flux1D LoRA</span>
            </h2>
            <div className="rt-tuit__stage-body">
              <p>
                <strong>Highest consistency. Largest upfront cost.</strong> When to use it:
                you&apos;re building a brand around a specific character or persona that will
                appear hundreds of times. You are willing to invest a weekend the first time you
                do it. You are comfortable opening a terminal and editing a YAML file.
              </p>
              <p>
                <strong>How it works.</strong>
              </p>
              <ol>
                <li>
                  <strong>Gather a dataset.</strong> Fifteen to thirty-plus images of the
                  character. Mix of angles, lighting setups, expressions, distances. Crop each
                  one to a consistent square or portrait aspect (1024×1024 or 1024×1280 are the
                  current Flux1D sweet spots). Remove blurry, watermarked, or off-character
                  images. The dataset is the entire game.
                </li>
                <li>
                  <strong>Caption each image.</strong> This is the step most beginners
                  underweight. Describe everything in the image <em>except</em> the character
                  itself — clothing, pose, environment, lighting, mood, expression. The model
                  will learn the character as the &quot;constant&quot; that appears under every
                  caption, and the captions teach it which variables you want to be able to
                  control later. Use a unique trigger word (e.g. <code>rtnl_man</code>) at the
                  start of every caption.
                </li>
                <li>
                  <strong>Pick a training environment.</strong>
                  <ul>
                    <li>
                      <em>RunPod or Vast.ai</em> (cloud GPU rental): ~$3-10 per full training
                      run. Cheapest option. Requires comfort with SSH and a Linux shell.
                    </li>
                    <li>
                      <em>Replicate&apos;s Flux LoRA trainer</em> (managed): pay per training
                      run, decent defaults, point-and-click. Easiest entry path.
                    </li>
                    <li>
                      <em>Local training on a 24 GB+ GPU</em> (3090, 4090, A6000): zero marginal
                      cost if you already own the hardware.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Train.</strong> Reasonable starting settings: 1500–3000 total steps,
                  learning rate between 1e-4 and 4e-4, batch size 1, network dimension 16–32.
                  Watch the loss converge but do not overtrain — past a certain point the model
                  starts memorising backgrounds and clothing instead of generalising the
                  character.
                </li>
                <li>
                  <strong>Test in ComfyUI or Forge.</strong> Load Flux1D base + your new LoRA
                  file at strength 0.7-1.0. Generate test prompts that include your trigger
                  word. Bad outputs almost always mean the dataset is bad, not that the training
                  is bad — go back to step 1.
                </li>
                <li>
                  <strong>Iterate.</strong> Prune the weakest three to five images from the
                  dataset. Retrain. Repeat until the LoRA reliably produces the character in
                  arbitrary scenes without prompting tricks.
                </li>
              </ol>
              <p>
                <strong>Tradeoffs.</strong>
              </p>
              <ul>
                <li>
                  <em>Pro:</em> Highest consistency available today. Character is portable across
                  any image tool that loads Flux LoRAs (a list that is growing fast). Once
                  trained, infinite generations cost nothing additional. The LoRA file is a few
                  hundred megabytes and lives on your own disk.
                </li>
                <li>
                  <em>Con:</em> One to two weekends the first time you do this. Requires
                  technical comfort with model files, ComfyUI graphs, dataset captioning, and
                  basic command-line work. Dataset quality dictates everything — there is no
                  amount of training that fixes a bad dataset, and that is the discovery most
                  first-time trainers make the hard way.
                </li>
              </ul>
              <p>
                <strong>Best for:</strong> long-running brand work, character-driven projects
                (graphic novels, recurring advertising creative, a personal site you intend to
                keep updating for years), or any case where method 02&apos;s portability stops
                being enough.
              </p>
            </div>
          </div>

          {/* Closer */}
          <div className="rt-tuit__stage">
            <h2 className="rt-tuit__stage-marker">
              <span className="rt-tuit__stage-num">·</span>
              <span className="rt-tuit__stage-label">What I actually use</span>
            </h2>
            <div className="rt-tuit__stage-body">
              <p>
                The portrait series on this site is Method 02. One anchor reference, generated
                through Nano Banana with reference-attach, with text-prompt overrides for the six
                moods (studio, warehouse, cinematic, profile, mid-shot, stage). Total build time
                across all six was about three evenings of cherry-picking, plus an hour of
                compositing.
              </p>
              <p>
                I am working on a Method 03 LoRA on the same character. When that ships, the
                cycling images here will get replaced with LoRA-generated variants, and the
                training notebook and dataset captioning notes will go up under{" "}
                <Link href="/#technical">Technical · Deep End</Link>.
              </p>
              <p>
                If you build one yourself using any of these methods, send it to me. I would
                like to see it.
              </p>
            </div>
          </div>

          <nav className="rt-tuit__nav" aria-label="Tutorial navigation">
            <Link className="button" href="/#creative">
              <span aria-hidden>←</span> Back to creative
            </Link>
            <Link className="button button--warm" href="/contact">
              Show me yours <span aria-hidden>→</span>
            </Link>
          </nav>
        </div>
      </article>
      <Footer />
      <AppChrome />
    </>
  );
}
