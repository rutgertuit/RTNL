export function Scroll({ size = 24, className }: { size?: number; className?: string }) {
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
      <path d="M19 17V5a2 2 0 0 0-2-2H4"/>
      <path d="M21 17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2"/>
      <path d="M8 7h6"/>
      <path d="M8 11h6"/>
      <path d="M8 15h4"/>
    </svg>
  );
}
