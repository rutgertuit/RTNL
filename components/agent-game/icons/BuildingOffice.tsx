export function BuildingOffice({ size = 24, className }: { size?: number; className?: string }) {
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
      <path d="M6 22V11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v11"/>
      <path d="M14 22V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v16"/>
      <path d="M2 22h20"/>
      <path d="M7 14h2"/>
      <path d="M7 18h2"/>
      <path d="M15 9h2"/>
      <path d="M15 13h2"/>
      <path d="M15 17h2"/>
    </svg>
  );
}
