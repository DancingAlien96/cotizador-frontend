// Rasteriza un membrete a imagen SIN html2canvas.
//
// html2canvas coloca cada palabra usando measureText(), y en el navegador del
// usuario esa medida sale alterada: el texto del membrete salia amontonado, y
// su render alternativo (foreignObject) devolvia un lienzo vacio.
//
// Aqui se traduce el membrete ya renderizado a un SVG normal y se deja que el
// navegador lo dibuje: el trazado del texto lo hace el motor de SVG, que no
// pasa por measureText. Las posiciones se LEEN del DOM
// (getBoundingClientRect), asi que la maquetacion sigue viniendo del
// componente <MembreteHeader/> y no se duplica aqui.

// Descarga un recurso y lo devuelve como data URI.
export async function aDataUrl(src: string): Promise<string | null> {
  try {
    const blob = await (await fetch(src)).blob();
    return await new Promise<string | null>((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ¿La captura no tiene nada visible? foreignObject a veces falla en silencio y
// devuelve un lienzo vacío o totalmente transparente; ahí hay que reintentar.
//
// Ojo con el canal alfa: un pixel transparente es (0,0,0,0), así que mirar solo
// el RGB lo confunde con negro y da el lienzo por bueno. Eso metía en el .docx
// una imagen invisible y el membrete parecía haber desaparecido.
export function noTieneNadaVisible(canvas: HTMLCanvasElement): boolean {
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let visibles = 0;
    for (let i = 0; i < data.length; i += 4 * 64) {
      if (data[i + 3] < 16) continue; // transparente: no se ve
      if (data[i] < 240 || data[i + 1] < 240 || data[i + 2] < 240) {
        if (++visibles > 20) return false;
      }
    }
    return true;
  } catch {
    return false; // lienzo contaminado: no podemos juzgar, lo damos por bueno
  }
}

// Aplana sobre blanco: Word no maneja bien un PNG con transparencia y el
// membrete se veria descolorido o invisible.
export function sobreBlanco(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const plano = document.createElement("canvas");
  plano.width = canvas.width;
  plano.height = canvas.height;
  const ctx = plano.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, plano.width, plano.height);
  ctx.drawImage(canvas, 0, 0);
  return plano;
}

// Rasteriza el membrete SIN html2canvas.
//
// html2canvas coloca cada palabra usando measureText(), y en el navegador del
// usuario esa medida sale alterada: el texto del membrete salia amontonado, y
// el render alternativo (foreignObject) devolvia un lienzo vacio.
//
// Aqui se traduce el membrete ya renderizado a un SVG normal y se deja que el
// navegador lo dibuje. El trazado del texto lo hace el motor de SVG, que no
// pasa por measureText. Las posiciones se LEEN del DOM (getBoundingClientRect),
// asi que la maquetacion sigue viniendo del componente y no se duplica aqui.

function esc(t: string): string {
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const TRANSPARENTE = /^(transparent$|rgba\(0, 0, 0, 0\))/;

// Convierte el elemento a un SVG con las mismas posiciones. `logos` trae las
// imagenes ya incrustadas: dentro de un SVG no se cargan recursos externos.
export function membreteASvg(
  m: HTMLElement,
  logos: Map<HTMLImageElement, string>,
): string {
  const base = m.getBoundingClientRect();
  const w = Math.round(base.width);
  const h = Math.round(base.height);
  const partes: string[] = [];
  const dx = (v: number) => +(v - base.left).toFixed(2);
  const dy = (v: number) => +(v - base.top).toFixed(2);

  const texto = (nodo: Text) => {
    const contenido = nodo.textContent ?? "";
    if (!contenido.trim()) return;
    const rango = document.createRange();
    rango.selectNodeContents(nodo);
    const r = rango.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const padre = nodo.parentElement;
    if (!padre) return;
    const st = getComputedStyle(padre);
    const espaciado =
      st.letterSpacing && st.letterSpacing !== "normal"
        ? ` letter-spacing="${esc(st.letterSpacing)}"`
        : "";
    // Geist no existe dentro del SVG (es un documento aislado): se deja una
    // alternativa web-safe explicita.
    partes.push(
      `<text x="${dx(r.left)}" y="${dy(r.top + r.height / 2)}"` +
        ` font-family="${esc(st.fontFamily)}, Arial, Helvetica, sans-serif"` +
        ` font-size="${esc(st.fontSize)}" font-weight="${esc(st.fontWeight)}"` +
        `${espaciado} fill="${esc(st.color)}" dominant-baseline="central"` +
        ` xml:space="preserve">${esc(contenido)}</text>`,
    );
  };

  const recorrer = (nodo: Node) => {
    if (nodo.nodeType === Node.TEXT_NODE) return texto(nodo as Text);
    if (nodo.nodeType !== Node.ELEMENT_NODE) return;
    const el = nodo as HTMLElement;
    const st = getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") return;
    const r = el.getBoundingClientRect();

    // Los <svg> (fondo del membrete e iconos) se reusan tal cual.
    if (el instanceof SVGSVGElement) {
      const attrs = Array.from(el.attributes)
        .filter((a) => !["class", "style", "x", "y", "width", "height"].includes(a.name))
        .map((a) => `${a.name}="${esc(a.value)}"`)
        .join(" ");
      partes.push(
        `<svg ${attrs} x="${dx(r.left)}" y="${dy(r.top)}"` +
          ` width="${r.width.toFixed(2)}" height="${r.height.toFixed(2)}">${el.innerHTML}</svg>`,
      );
      return; // no se desciende: ya va su contenido
    }

    if (el instanceof HTMLImageElement) {
      const datos = logos.get(el);
      if (datos) {
        partes.push(
          `<image x="${dx(r.left)}" y="${dy(r.top)}" width="${r.width.toFixed(2)}"` +
            ` height="${r.height.toFixed(2)}" href="${esc(datos)}" preserveAspectRatio="none"/>`,
        );
      }
      return;
    }

    // Fondo del elemento (el circulo blanco detras de cada icono).
    if (!TRANSPARENTE.test(st.backgroundColor)) {
      const radio = parseFloat(st.borderRadius) || 0;
      partes.push(
        `<rect x="${dx(r.left)}" y="${dy(r.top)}" width="${r.width.toFixed(2)}"` +
          ` height="${r.height.toFixed(2)}" rx="${Math.min(radio, r.height / 2).toFixed(2)}"` +
          ` fill="${esc(st.backgroundColor)}"/>`,
      );
    }

    el.childNodes.forEach(recorrer);
  };

  m.childNodes.forEach(recorrer);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"` +
    ` viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#ffffff"/>` +
    partes.join("") +
    `</svg>`
  );
}

// Dibuja el SVG en un lienzo. Al ser un data URI no contamina el canvas.
export async function svgALienzo(svg: string, w: number, h: number): Promise<HTMLCanvasElement> {
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("no se pudo dibujar el SVG del membrete"));
    img.src = url;
  });
  const escala = 2;
  const c = document.createElement("canvas");
  c.width = Math.round(w * escala);
  c.height = Math.round(h * escala);
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("sin contexto 2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

