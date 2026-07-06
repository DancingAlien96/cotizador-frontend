import type { CartaData } from "../lib/carta";
import { MembreteHeader, MembreteFooter } from "./membrete";

// Documento "Carta de Garantía" listo para vista previa e impresión.
export function CartaGarantia({ data }: { data: CartaData }) {
  return (
    <article className="carta">
      <MembreteHeader
        logoSrc="/logopromesa.png"
        showWordmark={false}
        logoClass="h-16"
      />

      <div className="carta-body">
      <p className="mb-5">
        {data.ciudad}, {data.fecha}
      </p>

      <div className="mb-5">
        <p>Señores:</p>
        <p className="font-bold">{data.institucion}</p>
        {data.dependencia && <p className="font-bold">{data.dependencia}</p>}
        <p>Presente</p>
      </div>

      <p className="mb-5">
        <span className="font-bold">Asunto:</span> Carta de Garantía – Evento No.{" "}
        <span className="font-bold">{data.evento}</span>
      </p>

      <p className="mb-5">Estimados señores:</p>

      <p className="mb-4 text-justify indent-12">
        Por medio de la presente, yo, {data.propietario}, en calidad de
        propietario de la empresa {data.empresa}, con dirección fiscal en{" "}
        {data.direccion}, NIT: {data.nit}, teléfono {data.telefono} y correo
        electrónico <span className="underline">{data.correo}</span>, hago
        constar lo siguiente:
      </p>

      <p className="mb-4 text-justify">
        Que, en caso de ser adjudicados en el evento No.{" "}
        <span className="font-bold">{data.evento}</span>, correspondiente a la
        cotización realizada al <span className="font-bold">{data.institucion}</span>
        , nos comprometemos a otorgar una garantía de {data.meses} meses sobre
        los equipos suministrados y los trabajos realizados.
      </p>

      <p className="mb-4 text-justify">
        Esta garantía cubrirá cualquier desperfecto de fabricación, fallas en
        los equipos instalados o inconvenientes derivados de la correcta
        ejecución del servicio, siempre que estos no sean ocasionados por mal
        uso, negligencia, intervenciones no autorizadas o factores externos
        fuera de nuestro control como desastres naturales.
      </p>

      <p className="mb-5 text-justify">
        Sin otro particular, quedamos a su disposición.
      </p>

      <p className="mb-2">Atentamente,</p>

      {/* Firma y sello */}
      <img
        src="/selloyfirma.png"
        alt="Firma y sello PROMESA"
        className="mb-1 w-72 max-w-full"
      />

      <div className="leading-tight">
        <p>{data.propietario}</p>
        <p>Propietario</p>
        <p>{data.firmanteEmpresa}</p>
        <p>Tel: {data.telefono}</p>
        <p>
          Correo: <span className="underline">{data.correoFirma}</span>
        </p>
      </div>
      </div>

      <MembreteFooter />
    </article>
  );
}
