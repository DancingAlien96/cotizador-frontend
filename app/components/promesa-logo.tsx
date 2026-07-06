// Logotipo PROMESA aproximado en SVG (gota + engranaje + wordmark).
// Reemplázalo por el logo oficial colocando `public/logo.png` y usando <img>
// si prefieres el arte original a color.
export function PromesaLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 64 80"
        className="h-full w-auto"
        role="img"
        aria-label="PROMESA"
      >
        <defs>
          <linearGradient id="drop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5ec8c8" />
            <stop offset="1" stopColor="#2b8a8a" />
          </linearGradient>
        </defs>
        <path
          d="M32 2C32 2 8 30 8 48a24 24 0 0 0 48 0C56 30 32 2 32 2Z"
          fill="url(#drop)"
        />
        <g fill="#ffffff" opacity="0.9">
          <circle cx="32" cy="48" r="8" fill="none" stroke="#fff" strokeWidth="3" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4;
            const x1 = 32 + Math.cos(a) * 11;
            const y1 = 48 + Math.sin(a) * 11;
            const x2 = 32 + Math.cos(a) * 15;
            const y2 = 48 + Math.sin(a) * 15;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}
        </g>
      </svg>
      <span className="text-2xl font-light tracking-[0.25em] text-teal-700">
        PROMESA
      </span>
    </div>
  );
}
