import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { ContactForm } from "./ContactForm";

const TITLE = "Contact — Rutger Tuit";
const DESCRIPTION =
  "Get in touch with Rutger Tuit. Speaking, press, strategic engagements with Dutch CMOs and agency CEOs, or notes on what you're building.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  robots: { index: true, follow: true },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://rutgertuit.nl/contact#page",
  name: TITLE,
  description: DESCRIPTION,
  url: "https://rutgertuit.nl/contact",
  inLanguage: "en",
  about: { "@id": "https://rutgertuit.nl/#person" },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <article className="rt-tuit rt-contact section section--surface">
        <div className="container">
          <div className="rt-tuit__head">
            <div className="eyebrow eyebrow--warm">CONTACT</div>
            <h1 className="rt-tuit__title">Tell me what you&apos;re building.</h1>
            <div className="rt-tuit__meta">
              <span>RESPONSE WINDOW · ~2 BUSINESS DAYS</span>
              <span>·</span>
              <span>EN / NL</span>
              <span>·</span>
              <span>BASED IN AMSTERDAM</span>
            </div>
          </div>

          <div className="rt-contact__intro">
            <p className="rt-contact__lead">
              I read every message that comes through here personally. Useful channels: speaking
              engagements and keynotes, press and interview requests, strategic engagements with
              Dutch-market CMOs and agency CEOs, the occasional collaborator who wants to compare
              notes on the homelab or one of the experiments.
            </p>
            <p className="rt-contact__lead">
              Less useful here: vendor pitches, cold sales, requests for free advice on private
              startups. Those will be politely ignored. Nothing personal — it&apos;s the only way
              this stays a manageable inbox.
            </p>
          </div>

          <ContactForm />

          <div className="rt-contact__elsewhere">
            <span className="eyebrow">ELSEWHERE</span>
            <p>
              Prefer asynchronous?{" "}
              <a
                href="https://www.linkedin.com/in/rutgertuit/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn DM
              </a>{" "}
              works equally well, and is the fastest fallback if the form misbehaves. Press kits,
              bios, photos, and speaking topics live on the{" "}
              <Link href="/#media-kit">Media Kit</Link>.
            </p>
          </div>
        </div>
      </article>
      <Footer />
      <AppChrome />
    </>
  );
}
