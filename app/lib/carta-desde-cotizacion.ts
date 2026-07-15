import type { CartaData } from "./carta";
import type { CotizacionGuatecomprasData } from "./cotizacion-guatecompras";

// Toma los datos que ya se llenaron en la cotización de Guatecompras y los
// reutiliza para la Carta de Garantía. Lo que no existe en la cotización
// (ciudad, meses de garantía, firma) conserva su valor por defecto.
export function cartaDesdeGuatecompras(
  g: CotizacionGuatecomprasData,
): Partial<CartaData> {
  return {
    fecha: g.fecha,
    institucion: g.cotizacionA,
    dependencia: g.dirigidaA,
    // En Guatecompras el evento se identifica con el Número de Operación (NOG)
    evento: g.numeroOperacion,
    propietario: g.razonSocial,
    empresa: g.empresaNombre,
    direccion: g.empresaDireccion,
    nit: g.empresaNit,
    telefono: g.telefono,
    correo: g.correo1,
    membreteCorreo: g.membreteCorreo,
    membreteTel1: g.membreteTel1,
    membreteTel2: g.membreteTel2,
  };
}

export const CARTA_PREFILL_KEY = "carta-prefill";
