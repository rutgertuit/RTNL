export function Walkout({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M13 4h3a2 2 0 0 1 2 2v14"/>
      <path d="M2 20h3"/>
      <path d="M13 20h9"/>
      <path d="M10 12v.01"/>
      <path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5.5 20.05a1 1 0 0 1-.5-.86V4.567a1 1 0 0 1 .684-.948l6.515-2.17A1 1 0 0 1 13 2.41z"/>
    </svg>
  );
}
