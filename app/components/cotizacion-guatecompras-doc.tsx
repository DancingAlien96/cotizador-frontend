import { MembreteHeader, MembreteFooter } from "./membrete";
import {
  totalItem,
  totalGeneral,
  formatQ,
  parseNum,
} from "../lib/cotizacion-privada";
import { quetzalesEnLetras } from "../lib/numero-a-letras";
import type { CotizacionGuatecomprasData } from "../lib/cotizacion-guatecompras";

export function CotizacionGuatecomprasDoc({
  data,
}: {
  data: CotizacionGuatecomprasData;
}) {
  const items = data.items.filter(
    (it) =>
      it.descripcion.trim() || it.cantidad.trim() || it.precioUnidad.trim(),
  );
  const total = totalGeneral(items);

  return (
    <article className="cotizacion">
      <MembreteHeader />

      <div className="cotizacion-body">
        {/* Datos generales */}
        <div className="mb-3">
          <p>
            <b>Fecha:</b> {data.fecha}
          </p>
          <p>
            <b>Número de Operación de Guatecompras:</b>{" "}
            <b>{data.numeroOperacion}</b>
          </p>
          <p>
            <b>Cotización a:</b> <b>{data.cotizacionA}</b>
          </p>
          <p>
            <b>Dirigida a:</b> {data.dirigidaA}
          </p>
          <p>
            <b>Dirección:</b> {data.direccion}
          </p>
          <p>
            <b>Nombre de la empresa:</b> <b>{data.empresaNombre}</b>
          </p>
          <p>
            <b>Razón Social:</b> <b>{data.razonSocial}</b>
          </p>
          <p>
            <b>Dirección fiscal de la empresa:</b> {data.empresaDireccion}{" "}
            <b>Nit:</b> {data.empresaNit}
          </p>
          <p>
            <b>Régimen:</b> {data.regimen} <b>Número de teléfono:</b>{" "}
            {data.telefono}
          </p>
          <p>
            <b>Correo electrónico:</b>{" "}
            <span className="text-blue-700 underline">{data.correo1}</span>
          </p>
          <p>
            <b>Correo electrónico 2:</b>{" "}
            <span className="text-blue-700 underline">{data.correo2}</span>
          </p>
        </div>

        <p>Pte.</p>
        <p className="mb-3">
          En atención a su solicitud presento la siguiente oferta ECONOMICA:
        </p>

        {/* Tabla */}
        <table className="tabla-cotizacion">
          <thead>
            <tr>
              <th>Descripción</th>
              <th className="w-20">Cantidad</th>
              <th className="w-32">Precio Unitario</th>
              <th className="w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>{it.descripcion}</td>
                <td className="text-center">{it.cantidad}</td>
                <td className="text-right">{formatQ(parseNum(it.precioUnidad))}</td>
                <td className="text-right">{formatQ(totalItem(it))}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td>&nbsp;</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td className="font-bold">Total</td>
              <td></td>
              <td></td>
              <td className="text-right font-bold">{formatQ(total)}</td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-3">
          <b className="underline">TOTAL EN LETRAS:</b>{" "}
          <b>{quetzalesEnLetras(total)}</b>
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
        <p className="mt-6">En espera de su respuesta atentamente:</p>
        <div className="mt-2">
          <img
            src="/selloyfirma.png"
            alt="Firma y sello PROMESA"
            className="w-56 max-w-full"
          />
          <div className="leading-tight">
            <p>César Eduardo Regalado</p>
            <p>Propietario</p>
            <p>Cel: {data.telefono}</p>
          </div>
        </div>
      </div>

      <MembreteFooter />
    </article>
  );
}
