import {
  type CotizacionPrivadaData,
  totalItem,
  totalGeneral,
  formatQ,
} from "../lib/cotizacion-privada";
import { quetzalesEnLetras } from "../lib/numero-a-letras";
import { MembreteHeader, MembreteFooter } from "./membrete";
import { CuadroDatos } from "./cuadro-datos";

export function CotizacionPrivadaDoc({
  data,
  numero,
}: {
  data: CotizacionPrivadaData;
  numero: string;
}) {
  const items = data.items.filter(
    (it) => it.descripcion.trim() || it.cantidad.trim() || it.precioUnidad.trim(),
  );
  const total = totalGeneral(items);

  return (
    <article className="cotizacion">
      <MembreteHeader
        correo={data.membreteCorreo}
        tel1={data.membreteTel1}
        tel2={data.membreteTel2}
      />

      <div className="cotizacion-body">
        {/* Número de cotización */}
        <div className="mb-2 text-right">
          <p className="font-bold">Cotización No. {numero}</p>
        </div>

        {/* Recuadro de datos (empresa + cliente) */}
        <CuadroDatos
          empresaNombre={data.empresaNombre}
          empresaNit={data.empresaNit}
          empresaDireccion={data.empresaDireccion}
          asesor={data.asesorNombre}
          empresaCelular={data.asesorTelefono}
          empresaCorreo={data.asesorCorreo}
          fecha={data.fecha}
          validez={data.validez}
          clienteNombre={data.clienteNombre}
          clienteNit={data.clienteNit}
          clienteCelular={data.clienteCelular}
          clienteCorreo={data.clienteCorreo}
        />

        {/* Destinatario (solo si hay cliente) */}
        {data.clienteNombre?.trim() && (
          <div className="mb-3">
            <p>Sres.</p>
            <p className="font-bold">{data.clienteNombre}</p>
            <p>Pte.</p>
          </div>
        )}

        <p className="mb-4 text-justify indent-10">
          En atención a su solicitud presento la siguiente oferta económica
          {data.concepto?.trim() ? ` para ${data.concepto}` : ""}:
        </p>

        {/* Tabla de ítems */}
        <table className="tabla-cotizacion">
          <thead>
            <tr>
              <th className="w-20">Cantidad</th>
              <th>Descripción</th>
              <th className="w-28">Precio Unidad</th>
              <th className="w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td className="text-center">{it.cantidad}</td>
                <td>{it.descripcion}</td>
                <td className="text-right">{formatQ(parseFloat(it.precioUnidad) || 0)}</td>
                <td className="text-right">{formatQ(totalItem(it))}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="text-center">&nbsp;</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-1 flex justify-end">
          <div className="flex gap-8 font-bold text-blue-700">
            <span>TOTAL</span>
            <span className="text-black">{formatQ(total)}</span>
          </div>
        </div>
        <p className="mt-1 text-right">
          <span className="font-bold text-blue-700 underline">Total</span> en
          letras: {quetzalesEnLetras(total)}
        </p>

        {/* Observaciones */}
        <div className="mt-4">
          <p className="font-bold">Observaciones:</p>
          <ul className="mt-1">
            {data.observaciones
              .filter((o) => o.trim())
              .map((o, i) => (
                <li key={i} className="flex gap-2">
                  <span>-</span>
                  <span>{o}</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Cierre y firma */}
        <p className="mt-8">En espera de su respuesta atentamente:</p>

        <div className="mt-2 flex flex-col items-end">
          <img
            src="/selloyfirma.png"
            alt="Firma y sello PROMESA"
            className="w-56 max-w-full"
          />
          <div className="text-center leading-tight">
            <p>César Eduardo Regalado Salguero</p>
            <p>Propietario</p>
            <p>
              Contacto: {data.asesorNombre} {data.asesorTelefono}
            </p>
          </div>
        </div>
      </div>

      <MembreteFooter />
    </article>
  );
}
