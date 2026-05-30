import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/footer/Footer";
import { AppChrome } from "@/components/chrome/AppChrome";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";

const TITLE = "Homelab";
const TAGLINE = "The hardware that runs everything else on this site.";
const DESCRIPTION =
  "Homelab is the physical infrastructure layer behind every other technical project on rutgertuit.nl. Two parts: a network (OPNsense + UniFi with 6 VLANs, segmented from management to guest) and a self-learning climate + energy system (Homey Pro v18 controller, 152 devices, 31 zones, BigQuery-backed thermal model that arbitrages against dynamic Tibber energy prices). Plus a Bang & Olufsen Mozart audio ecosystem stitched into the same fabric.";

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
      "@id": "https://rutgertuit.nl/technical/homelab#article",
      headline: TITLE,
      description: DESCRIPTION,
      url: "https://rutgertuit.nl/technical/homelab",
      author: { "@id": "https://rutgertuit.nl/#person" },
      inLanguage: "en",
      proficiencyLevel: "Expert",
    },
  ],
};

interface VlanRow {
  name: string;
  purpose: string;
}
const VLANS: VlanRow[] = [
  { name: "Management", purpose: "Network infrastructure itself — firewall, switches, controllers." },
  { name: "Secure", purpose: "High-trust devices, including the surveillance recorder. Tight egress." },
  { name: "Trusted", purpose: "Personal laptops, phones, workstations." },
  { name: "IoT", purpose: "Smart-home devices that should never talk to anything they don't have a reason to talk to." },
  { name: "Guest", purpose: "Anyone visiting. No lateral access." },
  { name: "Management LAN (legacy)", purpose: "Bootstrap-only path that exists so a misconfiguration on a VLAN never locks the network out of itself." },
];

interface NetworkRow {
  layer: string;
  detail: string;
}
const NETWORK: NetworkRow[] = [
  {
    layer: "Firewall",
    detail: "OPNsense with ISC DHCPv4. KPN delivers WAN as PPPoE over VLAN 6 — that single config is the load-bearing piece between the house and the internet.",
  },
  {
    layer: "Switching",
    detail: "UniFi Aggregation (10Gb uplink from KPN) → PoE Pro switch (10Gb to Aggregation) → USW24 for distribution (1Gb fiber).",
  },
  {
    layer: "Wireless",
    detail: "Seven UniFi access points. Two SSIDs broadcast — one bound to the Trusted VLAN, one to the IoT VLAN — so a smart bulb never lands on the same broadcast domain as a laptop.",
  },
  {
    layer: "Cameras",
    detail: "Seven UniFi Protect cameras + one UNVR. Recording stays on the Secure VLAN; egress is firewalled at the network boundary.",
  },
  {
    layer: "Inter-VLAN services",
    detail: "mDNS reflection, UDP broadcast relay, and IGMP Proxy configured per-VLAN. Required to make AirPlay, Sonos discovery, and B&O multiroom work across segments.",
  },
];

interface ClimateRow {
  layer: string;
  detail: string;
}
const CLIMATE: ClimateRow[] = [
  {
    layer: "Controller",
    detail: "Custom Homey Pro v18 — seasonal ranges, cold-feet prevention, comfort-signal model. The previous controllers (v14 → v17) are kept as references so behaviour drift is debuggable.",
  },
  {
    layer: "Heating",
    detail: "Five active floor-heating zones (1e verdieping) via Fibaro Smart Implant. Three pending zones on the ground floor. Heat pump is driven by a Fibaro Q2 wall relay rather than the heat pump's own thermostat.",
  },
  {
    layer: "Air conditioning",
    detail: "Six Daikin units. The Daikin cloud API is rate-limited to 200 calls/day per account, which the controller respects — polling cadence is the budget.",
  },
  {
    layer: "Sensors",
    detail: "25+ temperature sensors feeding a thermal model. Per-room thermal lag measured (35–55 min total) and used by the controller's lookahead.",
  },
  {
    layer: "Heating-rate ceiling",
    detail: "Max measured 1.58°C/hour (Bijkeuken). The controller respects per-room ceilings — anything faster is a sensor reporting wrong, not a comfort win.",
  },
  {
    layer: "Lighting",
    detail: "30 flows + 24 HomeyScript scripts. Presence-aware, scene-aware, motion-aware per room. 'Adaptive' in the sense that the rules adapt to the time of day and the mode of the house, not in the sense that an LLM picks the temperature.",
  },
];

interface EnergyRow {
  system: string;
  role: string;
}
const ENERGY: EnergyRow[] = [
  {
    system: "Tibber",
    role: "Dynamic energy prices (tomorrow's prices land after 13:00). The controller plans heating + EV charging against the price curve, not against the clock.",
  },
  {
    system: "Enphase",
    role: "Solar production + house battery. JWT-token refresh handled by the integration; the battery dispatches against the same price curve the heating reads.",
  },
  {
    system: "Zaptec",
    role: "EV wall-charging, driven by Tibber pricing. Charge during low-price windows by default; override by hand when needed.",
  },
  {
    system: "Load shedding",
    role: "energie_loadshed.js — the moment grid draw approaches the contract cap, the controller sheds the lowest-priority loads (deferred-acceptable ones first) instead of tripping the main.",
  },
  {
    system: "Tesla x2",
    role: "Both vehicles report state-of-charge into the same data plane; charging schedules sync against the same price + load curve.",
  },
];

interface AudioRow {
  brand: string;
  detail: string;
}
const AUDIO: AudioRow[] = [
  {
    brand: "B&O Mozart ecosystem",
    detail: "Beolab 28 (×2, daisy-chained, PTP-synced — EEE disabled at the switch port), Beoconnect Core (Mozart API on port 9000), Beosound Balance, Beosound Level (×2, portable), Beosound Stage soundbar. The Mozart stack does multiroom and Apple AirPlay across rooms.",
  },
  {
    brand: "Sonos",
    detail: "Sonos units configured with STP priority + IGMP Querier so multicast discovery survives the VLAN-segmented network.",
  },
  {
    brand: "Devialet",
    detail: "Two Phantoms in the attic. WiFi-only, 5GHz, deliberately on the same VLAN as the controller so their pairing magic works.",
  },
];

interface DesignChoice {
  title: string;
  body: string;
}
const DESIGN_CHOICES: DesignChoice[] = [
  {
    title: "Segment before you optimise",
    body: "Six VLANs. The IoT VLAN exists so a smart appliance with questionable firmware physically cannot pivot to a workstation. Every other 'smart home' problem is easier once that's true.",
  },
  {
    title: "Keep a bootstrap path",
    body: "The management LAN on the untagged native subnet stays around. Not for production — for the day a VLAN change is wrong and the firewall has to be reached without the VLAN config that's broken.",
  },
  {
    title: "OPNsense, single owner",
    body: "ISC DHCPv4 is on; Kea and Dnsmasq are off. One DHCP service, one source of truth. Configurations that 'mostly' work because multiple services are mostly-coordinating are how networks rot in private.",
  },
  {
    title: "Inter-VLAN services are explicit, not implicit",
    body: "mDNS reflection, UDP broadcast relay, IGMP Proxy. Each one written down per-VLAN, because every audio brand needs a slightly different one and forgetting one breaks the multiroom in a subtle way.",
  },
  {
    title: "Climate is a controller, not a chatbot",
    body: "The v18 thermostat is a deterministic model with seasonal ranges and cold-feet prevention. No LLM picks the setpoint. AI lives in the offline analytics layer that explains why a zone behaved oddly — not in the production loop.",
  },
  {
    title: "Energy arbitrage uses tomorrow's prices",
    body: "Tibber publishes the next day's price curve after 13:00. Heating windows + EV charging schedule against the next 24h, not the current hour. The house front-runs the grid.",
  },
  {
    title: "Daikin's rate limit is the polling budget",
    body: "200 calls/day per Daikin account. The controller treats that as a hard budget, not a guideline — adapts polling cadence per unit so the cap is never hit and the API stays responsive.",
  },
  {
    title: "Logs are the ground truth",
    body: "Every measurement, every controller decision, every device state lands in BigQuery via the sensor_uploader pipeline. Every weird behaviour can be back-traced. The data plane is the debugger.",
  },
];

interface DataLayer {
  layer: string;
  detail: string;
}
const DATA_LAYER: DataLayer[] = [
  {
    layer: "Capture",
    detail: "Homey Pro polls 152 devices every 5 minutes — sensors, switches, climate units, EV chargers, the lot.",
  },
  {
    layer: "Validate + ingest",
    detail: "Cloud Run worker validates the payload, drops malformed rows, and inserts into BigQuery (home_data.measurements).",
  },
  {
    layer: "Analyse",
    detail: "BigQuery is the long-term store. Thermal-model fitting, energy-arbitrage backtests, lighting-pattern analysis — all SQL against the same table.",
  },
  {
    layer: "Loop back",
    detail: "Lessons from the offline analysis become controller-version bumps (v17 → v18). The production loop stays simple; the analysis loop stays curious.",
  },
];

export default function HomelabPage() {
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
          { label: "Homelab" },
        ]}
      />
      <article className="rt-tuit rt-techwrite section section--surface">
        <div className="container">
          <header className="rt-techwrite__head">
            <div className="eyebrow eyebrow--warm">
              D · 06 · TECHNICAL WRITE-UP
            </div>
            <h1 className="rt-tuit__title">{TITLE}.</h1>
            <p className="rt-techwrite__tagline">{TAGLINE}</p>
            <p className="rt-tuit__lead">
              Two parts that act like one. A segmented network
              (OPNsense + UniFi, six VLANs) and a self-learning climate
              + energy system (Homey Pro v18, 152 devices, BigQuery
              behind it). The other technical projects on this site
              run on top of this. Documentation lives in two private
              repos — this page is the public version.
            </p>
            <ul className="rt-techwrite__meta">
              <li>
                <span className="eyebrow">SCOPE</span> A single house
                · production
              </li>
              <li>
                <span className="eyebrow">DEVICES</span> 152 across 31
                zones (climate side) · 7 APs · 7 cameras (network side)
              </li>
              <li>
                <span className="eyebrow">DATA</span> 5-minute sample
                cadence → Cloud Run → BigQuery
              </li>
              <li>
                <span className="eyebrow">STATUS</span> Production ·
                docs private · this page is the summary
              </li>
            </ul>
          </header>

          <section className="rt-techwrite__section">
            <div className="eyebrow">01 · THE NETWORK</div>
            <h2>Six VLANs, segmented on purpose.</h2>
            <p>
              The network exists so the rest of the system can. Every
              service that runs locally — climate, audio, surveillance,
              automations — sits on a VLAN that matches its trust
              level. A misbehaving device gets blast-radiused by its
              segment, not by the firewall&apos;s patience.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>VLAN</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {VLANS.map((v) => (
                    <tr key={v.name}>
                      <td>
                        <strong>{v.name}</strong>
                      </td>
                      <td>{v.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 style={{ marginTop: "var(--space-5)" }}>The hardware behind it</h3>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Layer</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {NETWORK.map((n) => (
                    <tr key={n.layer}>
                      <td>
                        <strong>{n.layer}</strong>
                      </td>
                      <td>{n.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">02 · CLIMATE + LIGHTING</div>
            <h2>One Homey Pro, one v18 controller, 152 devices.</h2>
            <p>
              The climate side is a self-learning thermostat with real
              feedback loops, not a thermostat with an app. Lighting
              and presence run on the same hub through the same
              scripting layer.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Layer</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {CLIMATE.map((c) => (
                    <tr key={c.layer}>
                      <td>
                        <strong>{c.layer}</strong>
                      </td>
                      <td>{c.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">03 · ENERGY ARBITRAGE</div>
            <h2>The house front-runs the grid.</h2>
            <p>
              Dynamic Dutch energy prices change every hour and
              tomorrow&apos;s curve lands after 13:00. The controller
              plans heating, EV charging, and battery dispatch against
              the next 24 hours — not the current price.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>System</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {ENERGY.map((e) => (
                    <tr key={e.system}>
                      <td>
                        <strong>{e.system}</strong>
                      </td>
                      <td>{e.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">04 · AUDIO</div>
            <h2>Bang &amp; Olufsen, Sonos, Devialet — on one fabric.</h2>
            <p>
              Multi-brand audio on a segmented network is mostly a
              multicast problem. mDNS reflection, IGMP Querier and
              STP priority are the unglamorous primitives that make
              multiroom &quot;just work&quot; across VLANs.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {AUDIO.map((a) => (
                    <tr key={a.brand}>
                      <td>
                        <strong>{a.brand}</strong>
                      </td>
                      <td>{a.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">05 · DATA PIPELINE</div>
            <h2>Homey Pro → Cloud Run → BigQuery.</h2>
            <p>
              The same data plane behind every interesting decision in
              the house. 152 devices × 5-minute cadence = a real
              time-series, validated on ingest and persisted long-term
              for analysis.
            </p>
            <div className="rt-techwrite__table">
              <table>
                <thead>
                  <tr>
                    <th>Layer</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {DATA_LAYER.map((d) => (
                    <tr key={d.layer}>
                      <td>
                        <strong>{d.layer}</strong>
                      </td>
                      <td>{d.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rt-techwrite__section">
            <div className="eyebrow">06 · NOTABLE DESIGN CHOICES</div>
            <h2>The lessons the network learned the hard way.</h2>
            <dl className="rt-techwrite__choices">
              {DESIGN_CHOICES.map((c) => (
                <div key={c.title}>
                  <dt>{c.title}</dt>
                  <dd>{c.body}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rt-techwrite__section rt-techwrite__section--closer">
            <div className="eyebrow eyebrow--warm">WHY THIS EXISTS</div>
            <p>
              Half of it is craft for craft&apos;s sake — running a
              real network at home is a privilege and a hobby. The
              other half is operational: if{" "}
              <Link href="/technical/luminary">Luminary</Link> needs a
              fresh checkout to deploy from, or{" "}
              <Link href="/technical/shop-life">Shop Life</Link> needs
              a private WhatsApp webhook to land, or{" "}
              <Link href="/technical/bedtime-stories">Bedtime Stories</Link>{" "}
              needs a place to render that isn&apos;t metered — the
              homelab is the floor everything else stands on. Worth
              writing down for that reason alone.
            </p>
          </section>
        </div>
      </article>
      <Footer />
      <AppChrome />
    </>
  );
}
