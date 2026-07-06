import {
  ivaDe,
  totalConIva,
  type PropuestaPiscinaData,
} from "../lib/propuesta-piscina";
import { formatQ } from "../lib/cotizacion-privada";

const AZUL = "#1c27d6";

function Seccion({
  n,
  titulo,
  children,
}: {
  n: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="sec">
        {n}. {titulo}
      </h2>
      {children}
    </section>
  );
}

export function PropuestaPiscinaDoc({ data }: { data: PropuestaPiscinaData }) {
  const ivaOp1 = ivaDe(data.subtotalOp1);
  const ivaOp2 = ivaDe(data.subtotalOp2);
  const totalOp1 = totalConIva(data.subtotalOp1);
  const totalOp2 = totalConIva(data.subtotalOp2);

  return (
    <article className="propuesta">
      <div className="propuesta-inner">
        {/* Portada */}
        <header className="mb-8 border-b-2 pb-6" style={{ borderColor: AZUL }}>
          <div className="mb-6 flex items-center justify-between">
            <img src="/proasalogo.png" alt="PROASA" className="h-16 w-auto" />
            <span className="text-xs text-zinc-500">www.proasa.com.gt</span>
          </div>
          <p
            className="text-sm font-semibold tracking-wide"
            style={{ color: AZUL }}
          >
            PROPUESTA TÉCNICA Y ECONÓMICA
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-800">
            {data.titulo}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">{data.subtitulo}</p>

          <p className="mt-4 text-justify">{data.descripcion}</p>

          <table className="tabla-piscina mt-5">
            <tbody>
              <tr>
                <td className="w-44 font-semibold">Cliente</td>
                <td>{data.cliente}</td>
              </tr>
              <tr>
                <td className="font-semibold">Ubicación</td>
                <td>{data.ubicacion}</td>
              </tr>
              <tr>
                <td className="font-semibold">Fecha de emisión</td>
                <td>{data.fechaEmision}</td>
              </tr>
              <tr>
                <td className="font-semibold">Vigencia de la oferta</td>
                <td>{data.vigencia}</td>
              </tr>
              <tr>
                <td className="font-semibold">Modalidad</td>
                <td>{data.modalidad}</td>
              </tr>
            </tbody>
          </table>
        </header>

        <Seccion n={1} titulo="ALCANCE DEL PROYECTO">
          <p className="pre text-justify">{data.alcanceProyecto}</p>
        </Seccion>

        <Seccion n={2} titulo="ALCANCE GENERAL Y FASES CONSTRUCTIVAS">
          <p className="pre text-justify">{data.fasesTexto}</p>
        </Seccion>

        <Seccion n={3} titulo="CRITERIOS DE DISEÑO Y OPERACIÓN">
          <p className="pre">{data.criterios}</p>
        </Seccion>

        <Seccion n={4} titulo="SUPUESTOS, LIMITACIONES Y EXCLUSIONES">
          <p className="pre text-justify">{data.supuestos}</p>
        </Seccion>

        <Seccion n={5} titulo="ALCANCES INCLUIDOS EN LA PROPUESTA">
          <p className="pre">{data.alcancesIncluidos}</p>
        </Seccion>

        <Seccion n={6} titulo="PROPUESTA ECONÓMICA — OPCIONES DE INVERSIÓN">
          <p className="text-justify">{data.introEconomica}</p>
          <table className="tabla-piscina">
            <thead>
              <tr>
                <th>Componente</th>
                <th className="op">
                  OPCIÓN 1
                  <br />
                  {data.nombreOp1}
                </th>
                <th className="op">
                  OPCIÓN 2
                  <br />
                  {data.nombreOp2}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.componentes.map((c, i) => (
                <tr key={i}>
                  <td>{c.nombre}</td>
                  <td className="op">{c.op1 ? "Incluido" : "No incluido"}</td>
                  <td className="op">{c.op2 ? "Incluido" : "No incluido"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Subtotal (sin IVA)</td>
                <td className="op">{formatQ(Number(data.subtotalOp1) || 0)}</td>
                <td className="op">{formatQ(Number(data.subtotalOp2) || 0)}</td>
              </tr>
              <tr>
                <td>IVA 12%</td>
                <td className="op">{formatQ(ivaOp1)}</td>
                <td className="op">{formatQ(ivaOp2)}</td>
              </tr>
              <tr className="destacado">
                <td>PRECIO TOTAL (IVA incluido)</td>
                <td className="op">{formatQ(totalOp1)}</td>
                <td className="op">{formatQ(totalOp2)}</td>
              </tr>
            </tfoot>
          </table>
          <p className="pre mt-3 text-justify text-[12.5px] text-zinc-600">
            {data.resumenEconomico}
          </p>
        </Seccion>

        <Seccion n={7} titulo="ANOTACIONES Y GARANTÍAS">
          <p className="pre">{data.garantiasTexto}</p>
        </Seccion>

        <Seccion n={8} titulo="ACEPTACIÓN Y CONDICIONES DE PAGO">
          <p className="pre text-justify">{data.condicionesPago}</p>
        </Seccion>

        <Seccion n={9} titulo="CRONOGRAMA GENERAL">
          <table className="tabla-piscina">
            <thead>
              <tr>
                <th>Fase</th>
                <th className="op">Duración</th>
              </tr>
            </thead>
            <tbody>
              {data.cronograma.map((f, i) => (
                <tr key={i}>
                  <td>{f.fase}</td>
                  <td className="op">{f.duracion}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="pre mt-2 text-[12px] text-zinc-600">
            {data.cronogramaNota}
          </p>
        </Seccion>

        {/* Anexo A — Plano */}
        {(data.planoTexto.trim() || data.planoDataUrl) && (
          <section>
            <h2 className="sec">ANEXO A — PLANO DE LA PISCINA</h2>
            {data.planoTexto.trim() && (
              <p className="pre text-justify">{data.planoTexto}</p>
            )}
            {data.planoDataUrl && (
              <img
                src={data.planoDataUrl}
                alt="Plano de la piscina"
                className="mx-auto mt-3 max-h-[520px] max-w-full border border-zinc-300"
              />
            )}
          </section>
        )}

        {/* Cierre */}
        <section className="mt-8 border-t-2 pt-5" style={{ borderColor: AZUL }}>
          <p className="text-justify">{data.cierreTexto}</p>
          <p className="mt-4">Atentamente,</p>
          <div className="mt-1 leading-snug">
            <p className="font-bold">
              PROYECTOS DEL AGUA PROASA S.A. — Diseño y Construcción de Piscinas
            </p>
            <p>contacto@proasa.com.gt</p>
            <p>
              Asesor de contacto: {data.asesor} · Cel. {data.asesorCel}
            </p>
            <p>Chiquimula, Guatemala, C.A.</p>
          </div>
          <div className="mt-3 text-[12.5px]">
            <p className="font-semibold">Método de pago:</p>
            <p>
              Cuenta Bancaria: 2900106416 Monetaria — Proyectos del Agua S.A.
              (Banco Industrial)
            </p>
            <p>
              Cuenta Bancaria: 3749033281 Monetaria — Proyectos del Agua S.A.
              (Banrural)
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
