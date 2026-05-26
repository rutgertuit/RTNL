export function Cash({ size = 24, className }: { size?: number; className?: string }) {
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
      <rect x="3" y="6" width="18" height="12" rx="1" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9h.01M18 9h.01M6 15h.01M18 15h.01" />
    </svg>
  );
}
