import { Nav } from "@/components/nav/Nav";
import { Hero } from "@/components/hero/Hero";
import { AnecdotalHook } from "@/components/chrome/AnecdotalHook";
import { EditorialColumn } from "@/components/editorial-column/EditorialColumn";
import { CreativeAtelier } from "@/components/creative-atelier/CreativeAtelier";
import { TechnicalIndex } from "@/components/technical-index/TechnicalIndex";
import { MediaKit } from "@/components/media-kit/MediaKit";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";

export default function HomePage() {
  return (
    <>
      <Nav />
      <Hero />

      {/* sunken → base (Hero is sunken; AnecdotalHook is base) */}
      <div className="rt-transit rt-transit--from-sunken rt-reveal" aria-hidden />

      <AnecdotalHook />

      {/* base → surface (entering Editorial) */}
      <div className="rt-transit rt-transit--into-surface rt-reveal" aria-hidden />
      <div className="rt-reveal">
        <EditorialColumn />
      </div>

      {/* surface → base (entering Creative) */}
      <div className="rt-transit rt-transit--into-base rt-reveal" aria-hidden />
      <div className="rt-reveal">
        <CreativeAtelier />
      </div>

      {/* base → sunken (entering Technical) */}
      <div className="rt-transit rt-transit--into-sunken rt-reveal" aria-hidden />
      <div className="rt-reveal">
        <TechnicalIndex />
      </div>

      {/* sunken → base (entering Media Kit) */}
      <div className="rt-transit rt-transit--from-sunken rt-reveal" aria-hidden />
      <div className="rt-reveal">
        <MediaKit />
      </div>

      {/* base → sunken (entering Footer) */}
      <div className="rt-transit rt-transit--into-sunken rt-reveal" aria-hidden />
      <Footer />

      <AppChrome />
    </>
  );
}
