import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Business & Leadership. -- Rutger Tuit";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#050507",
          color: "#F2EEE5",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          fontFamily: "serif",
        }}
      >
        <div style={{ fontFamily: "monospace", fontSize: 24, opacity: 0.6, letterSpacing: 4 }}>
          rutgertuit.nl
        </div>
        <div style={{ fontSize: 80, lineHeight: 1.05, marginTop: "auto" }}>
          Business &amp; Leadership.
        </div>
        <div style={{ fontSize: 28, marginTop: 16, color: "#E8623E", opacity: 0.85 }}>
          Three pieces from the day side of the desk.
        </div>
      </div>
    ),
    { ...size }
  );
}
