// components/NepaliRupeeIcon.tsx
export const NepaliRupeeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 12h12" /> {/* Horizontal line */}
    <path d="M10 16l4 -4" /> {/* Diagonal line (top-right to bottom-left) */}
    <path d="M10 8l4 4" /> {/* Diagonal line (bottom-right to top-left) */}
  </svg>
);
