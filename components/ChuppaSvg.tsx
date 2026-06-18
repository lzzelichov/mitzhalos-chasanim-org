// Elegant line-art chuppa (wedding canopy) over a Kotel/mountain scene.
// SITE POLICY: scene only — NO human figures.
const STARS = [
  [40, 30], [90, 18], [150, 36], [210, 22], [280, 32], [330, 16], [360, 44],
  [70, 55], [250, 52], [200, 60], [120, 64],
];

const WALL_ROWS = 4;
const WALL_COLS = 6;

export default function ChuppaSvg({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 400 320"
      className={className}
      style={style}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ch-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0a20" />
          <stop offset="1" stopColor="#2a2f5c" />
        </linearGradient>
        <linearGradient id="ch-canopy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f5e6d3" />
        </linearGradient>
      </defs>

      {/* Twilight sky */}
      <rect x="0" y="0" width="400" height="320" fill="url(#ch-sky)" />

      {/* Stars */}
      {STARS.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 1.8 : 1.1} fill="#e3cd8a" opacity={0.85} />
      ))}
      {/* Crescent-ish glow */}
      <circle cx="330" cy="70" r="16" fill="#e3cd8a" opacity="0.25" />

      {/* Distant mountain (Mount of Olives) silhouette */}
      <path d="M0 250 L70 205 L140 235 L210 195 L300 240 L400 210 L400 320 L0 320 Z" fill="#141838" />

      {/* Kotel wall (stone blocks) centered beneath the canopy */}
      <g>
        {Array.from({ length: WALL_ROWS }).map((_, r) =>
          Array.from({ length: WALL_COLS }).map((_, c) => {
            const bw = 34;
            const bh = 16;
            const offset = r % 2 === 0 ? 0 : bw / 2;
            const x = 110 + c * bw + offset - 8;
            const y = 236 + r * bh;
            if (x > 300) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={x}
                y={y}
                width={bw - 3}
                height={bh - 3}
                rx="2"
                fill="#3a3f63"
                stroke="#1a1f3c"
                strokeWidth="1"
              />
            );
          })
        )}
      </g>

      {/* Four poles */}
      {[70, 150, 250, 330].map((x) => (
        <g key={x}>
          <rect x={x - 3} y="120" width="6" height="160" rx="3" fill="#c9a84c" />
          <circle cx={x} cy="118" r="5" fill="#e3cd8a" />
        </g>
      ))}

      {/* Canopy cloth with a gentle drape */}
      <path
        d="M55 122 Q200 96 345 122 L345 132 Q200 112 55 132 Z"
        fill="url(#ch-canopy)"
        stroke="#c9a84c"
        strokeWidth="2"
      />
      <path d="M55 122 Q200 96 345 122 L345 122 Q200 100 55 122 Z" fill="#ffffff" opacity="0.6" />

      {/* Gold fringe hanging from the front edge */}
      {Array.from({ length: 21 }).map((_, i) => {
        const x = 60 + i * 14;
        return <path key={i} d={`M${x} 130 l5 10 l5 -10 Z`} fill="#c9a84c" />;
      })}
    </svg>
  );
}
