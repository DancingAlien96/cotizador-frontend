import { MembreteHeader, MembreteFooter } from "./membrete";
import { formatQ } from "../lib/cotizacion-privada";
import {
  totalItemTienda,
  subtotalTienda,
  totalTienda,
  type CotizacionTiendaData,
} from "../lib/cotizacion-tienda";

export function CotizacionTiendaDoc({
  data,
  numero,
}: {
  data: CotizacionTiendaData;
  numero: string;
}) {
  const items = data.items.filter(
    (it) => it.descripcion.trim() || it.precio.trim() || it.cantidad.trim(),
  );
  const subtotal = subtotalTienda(items);
  const total = totalTienda(items, data.otros);

  // Filas vacías para dar el aspecto de tabla del formato original.
  const filasVacias = Math.max(0, 4 - items.length);

  return (
    <article className="cotizacion tienda">
      <MembreteHeader
        correo={data.membreteCorreo}
        tel1={data.membreteTel1}
        tel2={data.membreteTel2}
      />

      <div className="cotizacion-body">
        {/* Encabezado: asesor y COTIZACIÓN + fechas */}
        <div className="mb-3 flex items-start justify-between">
          <div className="pt-6">
            <p>
              <b>Asesor de venta:</b> {data.asesor}
            </p>
          </div>
          <div className="text-right">
            <h2 className="mb-1 text-2xl font-bold tracking-wide text-[#27aae1]">
              COTIZACIÓN
            </h2>
            <table className="tabla-fechas ml-auto">
              <tbody>
                <tr>
                  <td className="font-bold">COTIZACIÓN No.</td>
                  <td className="font-bold">{numero}</td>
                </tr>
                <tr>
                  <td className="font-bold">FECHA</td>
                  <td>{data.fecha}</td>
                </tr>
                <tr>
                  <td className="font-bold">VALIDO HASTA</td>
                  <td>{data.validoHasta}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cliente */}
        <div className="tienda-bar mb-1">CLIENTE</div>
        <p className="font-bold">{data.cliente}</p>
        <p className="mb-3 font-bold text-blue-700 underline">
          NIT: {data.nitCliente}
        </p>

        {/* Tabla */}
        <table className="tabla-tienda">
          <thead>
            <tr>
              <th>DESCRIPCION</th>
              <th className="w-28 text-right">Precio</th>
              <th className="w-20 text-center">Cantidad</th>
              <th className="w-20 text-center">Unidad</th>
              <th className="w-28 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>{it.descripcion}</td>
                <td className="text-right">{formatQ(parseFloat(it.precio) || 0)}</td>
                <td className="text-center">{it.cantidad}</td>
                <td className="text-center">{it.unidad}</td>
                <td className="text-right">{formatQ(totalItemTienda(it))}</td>
              </tr>
            ))}
            {Array.from({ length: filasVacias }).map((_, i) => (
              <tr key={`v${i}`}>
                <td>&nbsp;</td>
                <td></td>
                <td></td>
                <td></td>
                <td className="text-right">{formatQ(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Términos + totales */}
        <div className="mt-3 flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="tienda-bar mb-1 inline-block pr-10">
              TÉRMINOS Y CONDICIONES
            </div>
            <ul className="mt-1">
              {data.terminos
                .filter((t) => t.trim())
                .map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
            </ul>
          </div>

          <table className="w-64">
            <tbody>
              <tr>
                <td className="py-0.5 text-right">Subtotal</td>
                <td className="py-0.5 text-right">{formatQ(subtotal)}</td>
              </tr>
              <tr>
                <td className="py-0.5 text-right">Otros</td>
                <td className="border border-zinc-300 py-0.5 text-right">
                  {formatQ(parseFloat(data.otros) || 0)}
                </td>
              </tr>
              <tr className="font-bold">
                <td className="py-0.5 text-right">TOTAL</td>
                <td className="bg-[#d7effa] py-0.5 text-right">
                  {formatQ(total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-10 text-center text-zinc-600">
          Si usted tiene alguna pregunta sobre esta cotización, por favor,
          póngase en contacto con nosotros
        </p>
      </div>

      <MembreteFooter />
    </article>
  );
}
