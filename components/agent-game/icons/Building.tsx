export function Building({ size = 24, className }: { size?: number; className?: string }) {
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
      <path d="M6 22V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v18"/>
      <path d="M2 22h20"/>
      <path d="M9 7h1"/>
      <path d="M14 7h1"/>
      <path d="M9 11h1"/>
      <path d="M14 11h1"/>
      <path d="M9 15h1"/>
      <path d="M14 15h1"/>
    </svg>
  );
}
