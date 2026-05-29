import type { Metadata } from "next";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { PressBody } from "./PressBody";
import type { PressItem, PullQuote } from "./PressBody";

const TITLE = "Press, interviews, and conversations";
const DESCRIPTION =
  "Twenty-four interviews, articles, podcast appearances, video panels and speaking engagements with or about Rutger Tuit, 2021 → 2025. Sourced from Think with Google, Adformatie, Marketing Tribune, Emerce, Fonk Magazine, Dutch Cowboys, ESNS, Amsterdam Dance Event, and others.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
};

const ARTICLES: PressItem[] = [
  {
    n: "01",
    title: "Winning ads: How to boost video creatives at each stage of the marketing funnel",
    publication: "Think with Google",
    date: "September 2022",
    description:
      "Co-authored article with Malin Stark about creating effective YouTube video creatives using ABCD principles for different stages of the marketing funnel. Based on insights from YouTube Works Awards winners in the Nordics & Benelux region.",
    url: "https://www.thinkwithgoogle.com/intl/en-emea/marketing-strategies/video/best-youtube-campaigns-video-creatives/",
  },
  {
    n: "02",
    title: "Unlocking growth in 2025: The 3 adjustments your marketing needs now",
    publication: "Think with Google",
    date: "April 2025",
    description:
      "Article outlining three strategic adjustments for marketing success in 2025: measurement and insights, media and personalisation, and creative and content.",
    url: "https://www.thinkwithgoogle.com/intl/en-emea/future-of-marketing/digital-transformation/transform-marketing-unlock-growth/",
  },
  {
    n: "03",
    title: "Appen met Rutger Tuit over de toekomst van adverteren op YouTube",
    publication: "Fonk Magazine",
    date: "September 2023",
    description:
      "WhatsApp interview about the YouTube Festival and the future of advertising on YouTube. Creator partnerships, diversity of content, and the evolving role of YouTube as a media platform.",
    url: "https://fonkmagazine.nl/artikelen/appen-met/appen-met-rutger-tuit-over-de-toekomst-van-adverteren-op-youtube-65641.html",
  },
  {
    n: "04",
    title: "Rutger Tuit: YouTube is tv, social, zoeken en shoppen",
    publication: "Adformatie",
    date: "November 2024",
    description:
      "The Tuit Doctrine in print: YouTube as a multi-format platform combining TV, social media, search, and shopping. How brands succeed with comprehensive 360-degree campaigns on the platform.",
    url: "https://www.adformatie.nl/marketing/merkstrategie/rutger-tuit-youtube-is-tv-social-zoeken-en-shoppen",
  },
  {
    n: "05",
    title: "Marketeer 155 — Head of brands & marketing partners bij Google",
    publication: "Marketing Tribune",
    date: "May 2021",
    description:
      "In-depth profile interview on the career path from KPN and GroupM to Google, views on video marketing, the importance of physical retail, and how marketing became Plan A. Creative optimisation, humour in marketing, and the pandemic's impact on digital acceleration.",
    url: "https://www.marketingtribune.nl/food-en-retail/nieuws/2021/05/marketeer-155-rutger-tuit-head-of-brands-and-marketing-partners-bij-google-/index.xml",
  },
  {
    n: "06",
    title: "DOSSIER DATASTROMEN: Rutger Tuit van Google",
    publication: "Marketing Tribune",
    date: "June 2022",
    description:
      "Interview about the digital renaissance, privacy, and data usage. How the internet is being reinvented, the importance of consumer privacy, the shift from traditional TV to on-demand video, and a plea to focus on building relationships through transparent data practices.",
    url: "https://www.marketingtribune.nl/online/nieuws/2022/06/dossier-datastromen-rutger-tuit-van-google/index.xml",
  },
  {
    n: "07",
    title: "Rutger Tuit (Google): 'De aandacht verschuift naar brand suitability'",
    publication: "Emerce",
    date: "March 2021",
    description:
      "On the launch of YouTube Select in the Netherlands, curated advertising packages, and the shift from brand safety to brand suitability. Advertisers moving from linear TV to online video as a flexible alternative.",
    url: "https://www.emerce.nl/nieuws/rutger-tuit-google-aandacht-verschuift-brand-suitability",
  },
  {
    n: "08",
    title: "YouTube viert twintigste verjaardag met groots festival",
    publication: "Fonk Magazine",
    date: "September 2025",
    description:
      "Coverage of YouTube's 20th anniversary festival featuring presentations by Rutger Tuit (Head of Agencies at the time) and Sam Vergauwen (Head of Benelux), along with case studies from Thuisbezorgd and Zelesta.",
    url: "https://fonkmagazine.nl/artikelen/marketing/youtube-viert-twintigste-verjaardag-met-groots-festival-voor-merken-en-bureaus-73928.html",
  },
  {
    n: "09",
    title: "YouTube Festival: YouTube wil met adverteerders de televisie overnemen",
    publication: "Dutch Cowboys",
    date: "September 2025",
    description:
      "Coverage of YouTube Festival: YouTube ads are 2.4× more effective than TV in driving demand and sales, the role of AI in video creation, and the importance of being present throughout the entire customer journey — not just during live events.",
    url: "https://www.dutchcowboys.nl/advertising/youtube-festival-youtube-wil-de-televisie-overnemen",
  },
  {
    n: "10",
    title: "junbi.ai Adds Connected TV Functionality",
    publication: "Alpha.one Blog",
    date: "September 2024",
    description:
      "Featured quote praising junbi.ai's new Connected TV functionality for ad testing capabilities, highlighting Google's collaboration with innovative ad-tech solutions.",
    url: "https://www.alpha.one/blog/junbi-ai-adds-connected-tv-functionality-to-enhance-existing-ad-testing-capabilities",
  },
];

const PODCASTS: PressItem[] = [
  {
    n: "11",
    title: "The Brief: Rutger Tuit (YouTube) over de toekomst van YouTube",
    publication: "Emerce / Wayne Parker Kent",
    date: "April 2022",
    description:
      "Podcast on how to survive on YouTube, the importance of patience and persistence, emerging trends including casting (live broadcasting), smart TVs, YouTube Shorts, NFTs, and how brands can maximise their YouTube presence.",
    url: "https://www.emerce.nl/interviews/podcast-the-brief-rutger-tuit-youtube-over-de-toekomst-van-youtube",
  },
  {
    n: "12",
    title: "Groeien op YouTube — een interview met Rutger Tuit",
    publication: "IMU (Institute of Marketing)",
    date: "December 2021",
    description:
      "Interview about YouTube growth strategies, the advertising side of YouTube, working with media agencies and brands, brand safety, the balance between traditional TV and YouTube content, and the importance of interactivity.",
    url: "https://imu.nl/interview-youtube-marketing/",
  },
];

const VIDEO: PressItem[] = [
  {
    n: "13",
    title: "Hoe groei je op YouTube? Interview met Rutger Tuit",
    publication: "Marketing Praat (YouTube)",
    date: "2021–2022",
    description:
      "Video interview discussing various YouTube growth strategies for businesses and marketers.",
    url: "https://www.youtube.com/watch?v=zAfKt8bQPIY",
  },
  {
    n: "14",
    title: "Marketing Report — Rutger Tuit, Martijn van Lieshout, Marloes Derks, Henri Lessing",
    publication: "YouTube",
    date: "June 2021",
    description:
      "Marketing Report episode featuring Rutger Tuit alongside other marketing professionals.",
    url: "https://www.youtube.com/watch?v=ikmm30I0hUg",
  },
  {
    n: "15",
    title: "20 jaar YouTube: wat werkt (en wat niet) — met Denise Kenter & Rutger Tuit",
    publication: "Google Ads Northern Europe (YouTube)",
    date: "July 2024",
    description:
      "Video discussion on 20 years of YouTube, covering what works and what doesn't in YouTube marketing and advertising.",
  },
];

const SPEAKING: PressItem[] = [
  {
    n: "16",
    title: "Marketing Effie Live — speaker profile",
    publication: "Marketing Effie Live",
    date: "Ongoing",
    description:
      "Speaker profile for Rutger Tuit, MT-lid bij Google Benelux, driving commercial growth for YouTube and guiding partners into an AI-driven future.",
    url: "https://marketingeffielive.nl/spreker/rutger-tuit/",
  },
  {
    n: "17",
    title: "Amsterdam Dance Event (ADE)",
    publication: "ADE",
    date: "Ongoing",
    description:
      "Speaker profile describing the role of creating joint growth with YouTube, marketing agencies, and branding clients at Google Netherlands.",
    url: "https://www.amsterdam-dance-event.nl/en/artists-speakers/rutger-tuit/1769239/",
  },
  {
    n: "18",
    title: "ESNS Conference 2024 — YouTube: A world stage for all",
    publication: "Eurosonic Noorderslag",
    date: "January 2024",
    description:
      "Panel discussion about YouTube as a platform for music and artists, exploring opportunities in the creator economy.",
    url: "https://esns.nl/en/conference/panels/youtube-a-world-stage-for-all/",
  },
  {
    n: "19",
    title: "YouTube Festival at Sugarfactory Amsterdam",
    publication: "Sugarfactory",
    date: "September 2023",
    description:
      "Event featuring Rutger Tuit speaking about YouTube developments and content for influencers, marketing professionals, and artists.",
    url: "https://www.sugarfactory.nl/en/past-events/youtube-festival/",
  },
  {
    n: "20",
    title: "Media 2030: Mediaconsument belangrijker als financier van content",
    publication: "MarketingFacts",
    date: "December 2021",
    description:
      "Event on the future of media and the consumer's role as content financier.",
    url: "https://www.marketingfacts.nl/berichten/media-2030-mediaconsument-belangrijker-als-financier-van-content/",
  },
  {
    n: "21",
    title: "Google Think Event with Dentsu",
    publication: "Dentsu Benelux",
    date: "2024",
    description:
      'Event featuring speakers Les Binet, Lieven Scheire, Rutger Tuit, and Pia Ghosh — described as "a goldmine of information" about marketing and advertising.',
    url: "https://www.linkedin.com/posts/dentsu-benelux_dentsu-google-googlethink-activity-7307759803219496960-AOFG",
  },
  {
    n: "22",
    title: "Incubeta × Meta Day — Shaping the Future of Measurement",
    publication: "Incubeta",
    date: "2024",
    description:
      "Event featuring Irem Yetener (Booking.com), Rutger Tuit and Boudewijn Beks (both Google) on measurement strategies.",
    url: "https://www.instagram.com/p/DLnIWJiMZ1D/",
  },
  {
    n: "23",
    title: "MarketingLive! — AI voor marketeers",
    publication: "Adformatie",
    date: "2024",
    description:
      "Event where Google experts Rutger Tuit and Kate Adams, along with Wesley ter Haar from MediaMonks, shared insights on AI's real impact on marketers.",
    url: "https://www.facebook.com/adformatie/posts/1463673488787158/",
  },
  {
    n: "24",
    title: "Abovo Maxlead — speaker profile",
    publication: "Abovo Maxlead",
    date: "Ongoing",
    description:
      "Speaker profile highlighting the background at KPN, GroupM, and Google/YouTube, offering broad perspective on the marketing landscape.",
    url: "https://www.abovomaxlead.nl/evenement-spreker/rutger-tuit/",
  },
];

const PULL_QUOTES: PullQuote[] = [
  {
    publication: "Adformatie",
    quote: "YouTube is tv, social, search, and shopping.",
    url: "https://www.adformatie.nl/marketing/merkstrategie/rutger-tuit-youtube-is-tv-social-zoeken-en-shoppen",
  },
  {
    publication: "Dutch Cowboys",
    quote:
      "YouTube ads are 2.4 times more effective than TV in driving demand and sales. Be present throughout the entire customer journey, not just during live events.",
    url: "https://www.dutchcowboys.nl/advertising/youtube-festival-youtube-wil-de-televisie-overnemen",
  },
  {
    publication: "Marketing Tribune",
    quote:
      "The internet is being reinvented. We must focus on building relationships through transparent data practices.",
    url: "https://www.marketingtribune.nl/online/nieuws/2022/06/dossier-datastromen-rutger-tuit-van-google/index.xml",
  },
  {
    publication: "Emerce",
    quote:
      "Advertisers are moving from linear TV to online video as a flexible alternative. The shift is from brand safety to brand suitability.",
    url: "https://www.emerce.nl/nieuws/rutger-tuit-google-aandacht-verschuift-brand-suitability",
  },
];

const ALL_ITEMS = [...ARTICLES, ...PODCASTS, ...VIDEO, ...SPEAKING];

const ld = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://rutgertuit.nl/press#page",
  name: TITLE,
  description: DESCRIPTION,
  inLanguage: "en",
  about: { "@id": "https://rutgertuit.nl/#person" },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: ALL_ITEMS.length,
    itemListElement: ALL_ITEMS.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "CreativeWork",
        name: item.title,
        url: item.url,
        publisher: { "@type": "Organization", name: item.publication },
        datePublished: item.date,
        description: item.description,
        about: { "@id": "https://rutgertuit.nl/#person" },
      },
    })),
  },
};

export default function PressPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Nav />
      <Breadcrumb trail={[
        { label: "Home", href: "/" },
        { label: "Press" },
      ]} />
      <PressBody
        articles={ARTICLES}
        podcasts={PODCASTS}
        video={VIDEO}
        speaking={SPEAKING}
        pullQuotes={PULL_QUOTES}
        totalCount={ALL_ITEMS.length}
      />
      <Footer />
      <AppChrome />
    </>
  );
}
