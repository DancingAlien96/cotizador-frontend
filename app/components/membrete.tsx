// Membrete PROMESA estilo corporativo: barra oscura con acento angular azul.
// Formas en SVG (no clip-path) para que se rendericen bien también en el PDF.

const AZUL = "#27AAE1";
const CYAN = "#74D6F4";
const AZUL_OSC = "#1B7CA6";
const NEGRO = "#231F20";

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill={AZUL}>
      <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13A1.5 1.5 0 0 1 20.5 20h-17A1.5 1.5 0 0 1 2 18.5Z" />
      <path d="m4 7 8 5 8-5" fill="none" stroke={NEGRO} strokeWidth="1.8" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill={AZUL}>
      <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11 11 0 0 0 3.5.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.3a1 1 0 0 1 1 1 11 11 0 0 0 .56 3.5 1 1 0 0 1-.25 1Z" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke={AZUL} strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

export function MembreteHeader({
  logoSrc = "/logocotizacionprivada.png",
  showWordmark = true,
  logoClass = "h-[58px]",
  logoBadge = false,
}: {
  logoSrc?: string;
  showWordmark?: boolean;
  logoClass?: string;
  logoBadge?: boolean;
}) {
  return (
    <div className="membrete relative h-[76px] w-full overflow-hidden bg-white">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 76"
        preserveAspectRatio="none"
      >
        {/* Barra oscura */}
        <polygon points="0,0 800,0 800,76 0,76" fill={NEGRO} />
        {/* Acento angular azul en la esquina derecha */}
        <polygon points="690,0 800,0 800,76 630,76" fill={AZUL_OSC} />
        <polygon points="742,0 800,0 800,76 682,76" fill={AZUL} />
        <polygon points="742,0 756,0 696,76 682,76" fill={CYAN} />
      </svg>

      {/* Marca */}
      <div className="absolute left-6 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {logoBadge ? (
          <span className="flex items-center rounded-lg bg-white px-2 py-1">
            <img src={logoSrc} alt="PROMESA" className={`${logoClass} w-auto`} />
          </span>
        ) : (
          <img src={logoSrc} alt="PROMESA" className={`${logoClass} w-auto`} />
        )}
        {showWordmark && (
          <div className="leading-none text-white">
            <div className="text-xl font-light tracking-[0.32em]">PROMESA</div>
            <div className="mt-1 text-[8px] tracking-[0.2em] text-white/90">
              TRATAMIENTO DE AGUA
            </div>
          </div>
        )}
      </div>

      {/* Contacto (sobre la barra oscura) */}
      <div className="absolute right-[168px] top-1/2 flex -translate-y-1/2 flex-col items-end gap-1 text-[10px] leading-tight text-white">
        <div className="flex items-center gap-1.5">
          eregalado@aquaequipos.com
          <span className="rounded-full bg-white p-0.5">
            <IconMail />
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          +502 3340 7786 / 4004 5414
          <span className="rounded-full bg-white p-0.5">
            <IconPhone />
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          www.aquaequipos.com
          <span className="rounded-full bg-white p-0.5">
            <IconGlobe />
          </span>
        </div>
      </div>
    </div>
  );
}

export function MembreteFooter() {
  return (
    <div className="membrete relative h-[60px] w-full overflow-hidden bg-white">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 60"
        preserveAspectRatio="none"
      >
        {/* Barra oscura */}
        <polygon points="0,0 800,0 800,60 0,60" fill={NEGRO} />
        {/* Acento angular azul en la esquina izquierda */}
        <polygon points="0,0 170,0 110,60 0,60" fill={AZUL_OSC} />
        <polygon points="0,0 118,0 58,60 0,60" fill={AZUL} />
        <polygon points="104,0 118,0 58,60 44,60" fill={CYAN} />
      </svg>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.18em] text-white/85">
        8va. Avenida Calzada 2 Hector, Zona 2, Chiquimula, Guatemala.
      </div>
    </div>
  );
}
