const SHAPES = {
  compaction: (
    <>
      <rect x="14" y="16" width="36" height="18" rx="3" />
      <path d="M12 42h40M16 50h32" />
    </>
  ),
  concrete: (
    <>
      <path d="M20 18h24l-6 24H26z" />
      <path d="M32 42v8M24 50h16" />
    </>
  ),
  power: (
    <>
      <circle cx="32" cy="32" r="17" />
      <path d="M34 21l-9 14h7l-2 10 9-14h-7z" />
    </>
  ),
  height: (
    <>
      <path d="M22 14v36M42 14v36" />
      <path d="M22 24h20M22 32h20M22 40h20" />
    </>
  ),
  hand: (
    <>
      <rect x="18" y="16" width="28" height="10" rx="2" />
      <path d="M32 26v22" />
      <path d="M27 48h10l-5 6z" />
    </>
  ),
}

export default function ToolGlyph({ type }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="h-16 w-16 stroke-accent"
      fill="none"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {SHAPES[type] ?? SHAPES.hand}
    </svg>
  )
}
