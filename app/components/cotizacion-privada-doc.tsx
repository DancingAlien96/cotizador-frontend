import {
  type CotizacionPrivadaData,
  TELEFONO_EMPRESA,
  totalItem,
  totalGeneral,
  formatQ,
} from "../lib/cotizacion-privada";
import { quetzalesEnLetras } from "../lib/numero-a-letras";
import { MembreteHeader, MembreteFooter } from "./membrete";

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
      <MembreteHeader />

      <div className="cotizacion-body">
        {/* Datos del emisor */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p>
              <span className="font-bold">Fecha:</span> {data.fecha}
            </p>
            <p>
              <span className="font-bold">Nombre de la empresa:</span>{" "}
              {data.empresaNombre}
            </p>
            <p>
              <span className="font-bold">Dirección fiscal de la empresa:</span>{" "}
              {data.empresaDireccion}
            </p>
            <p>
              <span className="font-bold">Nit:</span> {data.empresaNit}
            </p>
            <p>
              <span className="font-bold">Número de teléfono:</span>{" "}
              {data.asesorTelefono} / {TELEFONO_EMPRESA}
            </p>
            <p>
              <span className="font-bold">Correo electrónico:</span>{" "}
              <span className="text-blue-700 underline">{data.asesorCorreo}</span>
            </p>
            <p>
              <span className="font-bold">Asesora de venta:</span>{" "}
              {data.asesorNombre}
            </p>
          </div>
          <p className="whitespace-nowrap font-bold">Cotización No. {numero}</p>
        </div>

        {/* Destinatario */}
        <div className="mb-3">
          <p>Sres.</p>
          <p className="font-bold">{data.clienteNombre}</p>
          <p>Pte.</p>
        </div>

        <p className="mb-4 text-justify indent-10">
          En atención a su solicitud presento la siguiente oferta económica para{" "}
          {data.concepto}:
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
