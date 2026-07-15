// Cuerpos de documento en HTML compatible con Word (texto y tablas editables).
// Se usan tablas para el diseño porque Word no soporta flexbox.

import {
  formatQ,
  parseNum,
  totalItem,
  totalGeneral,
  type CotizacionPrivadaData,
} from "./cotizacion-privada";
import type { CotizacionGuatecomprasData } from "./cotizacion-guatecompras";
import {
  totalItemTienda,
  subtotalTienda,
  totalTienda,
  type CotizacionTiendaData,
} from "./cotizacion-tienda";
import { quetzalesEnLetras } from "./numero-a-letras";
import type { CartaData } from "./carta";
import {
  ivaDe,
  totalConIva,
  type PropuestaPiscinaData,
} from "./propuesta-piscina";

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function nl2br(s: string): string {
  return esc(s).replace(/\n/g, "<br />");
}

const TD = 'style="border:1px solid #000;padding:5pt;vertical-align:top"';
const TH = `style="border:1px solid #000;padding:5pt;font-weight:bold;text-align:center"`;
const FIRMA = '<img src="/selloyfirma.png" style="width:5.5cm" />';

// ---------- Empresas ----------
export function wordBodyEmpresas(
  data: CotizacionPrivadaData,
  numero: string,
): string {
  const items = data.items.filter((i) => i.descripcion.trim() || i.cantidad.trim());
  const total = totalGeneral(items);
  return `
<table style="width:100%"><tr>
  <td style="vertical-align:top">
    <p><b>Fecha:</b> ${esc(data.fecha)}<br />
    <b>Nombre de la empresa:</b> ${esc(data.empresaNombre)}<br />
    <b>Dirección fiscal de la empresa:</b> ${esc(data.empresaDireccion)}<br />
    <b>Nit:</b> ${esc(data.empresaNit)}<br />
    <b>Número de teléfono:</b> ${esc(data.asesorTelefono)} / 4004-5414<br />
    <b>Correo electrónico:</b> ${esc(data.asesorCorreo)}<br />
    <b>Asesora de venta:</b> ${esc(data.asesorNombre)}</p>
  </td>
  <td style="vertical-align:top;text-align:right;white-space:nowrap">
    <p><b>Cotización No. ${esc(numero)}</b></p>
  </td>
</tr></table>

<p>Sres.<br /><b>${esc(data.clienteNombre)}</b><br />Pte.</p>
<p style="text-align:justify;text-indent:1cm">En atención a su solicitud presento la siguiente oferta económica para ${esc(data.concepto)}:</p>

<table style="width:100%">
  <tr>
    <th ${TH} style="border:1px solid #000;padding:5pt;font-weight:bold;text-align:center;width:2cm">Cantidad</th>
    <th ${TH}>Descripción</th>
    <th ${TH} style="border:1px solid #000;padding:5pt;font-weight:bold;text-align:center;width:3cm">Precio Unidad</th>
    <th ${TH} style="border:1px solid #000;padding:5pt;font-weight:bold;text-align:center;width:3cm">Total</th>
  </tr>
  ${items
    .map(
      (it) => `<tr>
    <td ${TD} style="border:1px solid #000;padding:5pt;text-align:center">${esc(it.cantidad)}</td>
    <td ${TD}>${esc(it.descripcion)}</td>
    <td ${TD} style="border:1px solid #000;padding:5pt;text-align:right">${formatQ(parseNum(it.precioUnidad))}</td>
    <td ${TD} style="border:1px solid #000;padding:5pt;text-align:right">${formatQ(totalItem(it))}</td>
  </tr>`,
    )
    .join("")}
</table>

<p style="text-align:right"><b>TOTAL&nbsp;&nbsp;&nbsp;${formatQ(total)}</b></p>
<p style="text-align:right"><b><u>Total</u></b> en letras: ${esc(quetzalesEnLetras(total))}</p>

<p><b>Observaciones:</b></p>
<ul>${data.observaciones.filter((o) => o.trim()).map((o) => `<li>${esc(o)}</li>`).join("")}</ul>

<p>En espera de su respuesta atentamente:</p>
<p style="text-align:right">${FIRMA}</p>
<p style="text-align:right">César Eduardo Regalado Salguero<br />Propietario<br />Contacto: ${esc(data.asesorNombre)} ${esc(data.asesorTelefono)}</p>
`;
}

// ---------- Tienda ----------
export function wordBodyTienda(data: CotizacionTiendaData): string {
  const items = data.items.filter((i) => i.descripcion.trim() || i.precio.trim());
  const subtotal = subtotalTienda(items);
  const total = totalTienda(items, data.otros);
  return `
<table style="width:100%"><tr>
  <td style="vertical-align:top"><p><b>Asesor de venta:</b> ${esc(data.asesor)}</p></td>
  <td style="vertical-align:top;text-align:right">
    <p style="font-size:18pt;color:#27aae1"><b>COTIZACIÓN</b></p>
    <table style="margin-left:auto">
      <tr><td ${TD}><b>FECHA</b></td><td ${TD}>${esc(data.fecha)}</td></tr>
      <tr><td ${TD}><b>VALIDO HASTA</b></td><td ${TD}>${esc(data.validoHasta)}</td></tr>
    </table>
  </td>
</tr></table>

<p style="background:#27aae1;color:#fff;padding:3pt"><b>CLIENTE</b></p>
<p><b>${esc(data.cliente)}</b><br /><b>NIT: ${esc(data.nitCliente)}</b></p>

<table style="width:100%">
  <tr>
    <th ${TH} style="border:1px solid #000;padding:5pt;background:#27aae1;color:#fff;text-align:left">DESCRIPCION</th>
    <th ${TH} style="border:1px solid #000;padding:5pt;background:#27aae1;color:#fff;width:2.6cm">Precio</th>
    <th ${TH} style="border:1px solid #000;padding:5pt;background:#27aae1;color:#fff;width:2cm">Cantidad</th>
    <th ${TH} style="border:1px solid #000;padding:5pt;background:#27aae1;color:#fff;width:2cm">Unidad</th>
    <th ${TH} style="border:1px solid #000;padding:5pt;background:#27aae1;color:#fff;width:2.6cm">TOTAL</th>
  </tr>
  ${items
    .map(
      (it) => `<tr>
    <td ${TD}>${esc(it.descripcion)}</td>
    <td ${TD} style="border:1px solid #000;padding:5pt;text-align:right">${formatQ(parseNum(it.precio))}</td>
    <td ${TD} style="border:1px solid #000;padding:5pt;text-align:center">${esc(it.cantidad)}</td>
    <td ${TD} style="border:1px solid #000;padding:5pt;text-align:center">${esc(it.unidad)}</td>
    <td ${TD} style="border:1px solid #000;padding:5pt;text-align:right">${formatQ(totalItemTienda(it))}</td>
  </tr>`,
    )
    .join("")}
</table>

<table style="width:100%;margin-top:6pt"><tr>
  <td style="vertical-align:top;width:60%">
    <p style="background:#27aae1;color:#fff;padding:3pt"><b>TÉRMINOS Y CONDICIONES</b></p>
    ${data.terminos.filter((t) => t.trim()).map((t) => `<p>${esc(t)}</p>`).join("")}
  </td>
  <td style="vertical-align:top">
    <table style="margin-left:auto">
      <tr><td style="text-align:right;padding:2pt">Subtotal</td><td style="text-align:right;padding:2pt">${formatQ(subtotal)}</td></tr>
      <tr><td style="text-align:right;padding:2pt">Otros</td><td style="text-align:right;padding:2pt">${formatQ(parseNum(data.otros))}</td></tr>
      <tr><td style="text-align:right;padding:2pt"><b>TOTAL</b></td><td style="text-align:right;padding:2pt;background:#d7effa"><b>${formatQ(total)}</b></td></tr>
    </table>
  </td>
</tr></table>

<p style="text-align:center;color:#555;margin-top:18pt">Si usted tiene alguna pregunta sobre esta cotización, por favor, póngase en contacto con nosotros</p>
`;
}

// ---------- Guatecompras ----------
export function wordBodyGuatecompras(data: CotizacionGuatecomprasData): string {
  const items = data.items.filter((i) => i.descripcion.trim() || i.cantidad.trim());
  const total = totalGeneral(items);
  return `
<p><b>Fecha:</b> ${esc(data.fecha)}<br />
<b>Número de Operación de Guatecompras:</b> <b>${esc(data.numeroOperacion)}</b><br />
<b>Cotización a:</b> <b>${esc(data.cotizacionA)}</b><br />
<b>Dirigida a:</b> ${esc(data.dirigidaA)}<br />
<b>Dirección:</b> ${esc(data.direccion)}<br />
<b>Nombre de la empresa:</b> <b>${esc(data.empresaNombre)}</b><br />
<b>Razón Social:</b> <b>${esc(data.razonSocial)}</b><br />
<b>Dirección fiscal de la empresa:</b> ${esc(data.empresaDireccion)} <b>Nit:</b> ${esc(data.empresaNit)}<br />
<b>Régimen:</b> ${esc(data.regimen)} <b>Número de teléfono:</b> ${esc(data.telefono)}<br />
<b>Correo electrónico:</b> ${esc(data.correo1)}<br />
<b>Correo electrónico 2:</b> ${esc(data.correo2)}</p>

<p>Pte.<br />En atención a su solicitud presento la siguiente oferta ECONOMICA:</p>

<table style="width:100%">
  <tr>
    <th ${TH} style="border:1px solid #000;padding:5pt;font-weight:bold;text-align:center">Descripción</th>
    <th ${TH} style="border:1px solid #000;padding:5pt;font-weight:bold;text-align:center;width:2cm">Cantidad</th>
    <th ${TH} style="border:1px solid #000;padding:5pt;font-weight:bold;text-align:center;width:3cm">Precio Unitario</th>
    <th ${TH} style="border:1px solid #000;padding:5pt;font-weight:bold;text-align:center;width:3cm">Total</th>
  </tr>
  ${items
    .map(
      (it) => `<tr>
    <td ${TD}>${esc(it.descripcion)}</td>
    <td ${TD} style="border:1px solid #000;padding:5pt;text-align:center">${esc(it.cantidad)}</td>
    <td ${TD} style="border:1px solid #000;padding:5pt;text-align:right">${formatQ(parseNum(it.precioUnidad))}</td>
    <td ${TD} style="border:1px solid #000;padding:5pt;text-align:right">${formatQ(totalItem(it))}</td>
  </tr>`,
    )
    .join("")}
  <tr>
    <td ${TD}><b>Total</b></td><td ${TD}></td><td ${TD}></td>
    <td ${TD} style="border:1px solid #000;padding:5pt;text-align:right"><b>${formatQ(total)}</b></td>
  </tr>
</table>

<p><b><u>TOTAL EN LETRAS:</u></b> <b>${esc(quetzalesEnLetras(total))}</b></p>

<p><b>Observaciones:</b></p>
<ul>${data.observaciones.filter((o) => o.trim()).map((o) => `<li>${esc(o)}</li>`).join("")}</ul>

<p>En espera de su respuesta atentamente:</p>
<p>${FIRMA}</p>
<p>César Eduardo Regalado<br />Propietario<br />Cel: ${esc(data.telefono)}</p>
`;
}

// ---------- Carta de Garantía ----------
export function wordBodyCarta(data: CartaData): string {
  return `
<p>${esc(data.ciudad)}, ${esc(data.fecha)}</p>
<p>Señores:<br /><b>${esc(data.institucion)}</b><br />${data.dependencia ? `<b>${esc(data.dependencia)}</b><br />` : ""}Presente</p>
<p><b>Asunto:</b> Carta de Garantía – Evento No. <b>${esc(data.evento)}</b></p>
<p>Estimados señores:</p>
<p style="text-align:justify;text-indent:1cm">Por medio de la presente, yo, ${esc(data.propietario)}, en calidad de propietario de la empresa ${esc(data.empresa)}, con dirección fiscal en ${esc(data.direccion)}, NIT: ${esc(data.nit)}, teléfono ${esc(data.telefono)} y correo electrónico ${esc(data.correo)}, hago constar lo siguiente:</p>
<p style="text-align:justify">Que, en caso de ser adjudicados en el evento No. <b>${esc(data.evento)}</b>, correspondiente a la cotización realizada al <b>${esc(data.institucion)}</b>, nos comprometemos a otorgar una garantía de ${esc(data.meses)} meses sobre los equipos suministrados y los trabajos realizados.</p>
<p style="text-align:justify">Esta garantía cubrirá cualquier desperfecto de fabricación, fallas en los equipos instalados o inconvenientes derivados de la correcta ejecución del servicio, siempre que estos no sean ocasionados por mal uso, negligencia, intervenciones no autorizadas o factores externos fuera de nuestro control como desastres naturales.</p>
<p style="text-align:justify">Sin otro particular, quedamos a su disposición.</p>
<p>Atentamente,</p>
<p>${FIRMA}</p>
<p>${esc(data.propietario)}<br />Propietario<br />${esc(data.firmanteEmpresa)}<br />Tel: ${esc(data.telefono)}<br />Correo: ${esc(data.correoFirma)}</p>
`;
}

// ---------- Piscina (PROASA) ----------
export function wordBodyPiscina(data: PropuestaPiscinaData): string {
  const sec = (n: number | string, t: string) =>
    `<p style="color:#1c27d6;font-size:13pt;border-bottom:2px solid #1c27d6"><b>${n}. ${esc(t)}</b></p>`;
  return `
<table style="width:100%"><tr>
  <td style="vertical-align:middle"><img src="/proasalogo.png" style="height:1.6cm" /></td>
  <td style="vertical-align:middle;text-align:right;color:#555">www.proasa.com.gt</td>
</tr></table>
<p style="color:#1c27d6"><b>PROPUESTA TÉCNICA Y ECONÓMICA</b></p>
<p style="font-size:18pt"><b>${esc(data.titulo)}</b></p>
<p style="color:#555">${esc(data.subtitulo)}</p>
<p style="text-align:justify">${esc(data.descripcion)}</p>
<table style="width:100%">
  <tr><td ${TD} style="border:1px solid #c9c9c9;padding:5pt;width:5cm"><b>Cliente</b></td><td ${TD} style="border:1px solid #c9c9c9;padding:5pt">${esc(data.cliente)}</td></tr>
  <tr><td ${TD} style="border:1px solid #c9c9c9;padding:5pt"><b>Ubicación</b></td><td ${TD} style="border:1px solid #c9c9c9;padding:5pt">${esc(data.ubicacion)}</td></tr>
  <tr><td ${TD} style="border:1px solid #c9c9c9;padding:5pt"><b>Fecha de emisión</b></td><td ${TD} style="border:1px solid #c9c9c9;padding:5pt">${esc(data.fechaEmision)}</td></tr>
  <tr><td ${TD} style="border:1px solid #c9c9c9;padding:5pt"><b>Vigencia de la oferta</b></td><td ${TD} style="border:1px solid #c9c9c9;padding:5pt">${esc(data.vigencia)}</td></tr>
  <tr><td ${TD} style="border:1px solid #c9c9c9;padding:5pt"><b>Modalidad</b></td><td ${TD} style="border:1px solid #c9c9c9;padding:5pt">${esc(data.modalidad)}</td></tr>
</table>

${sec(1, "ALCANCE DEL PROYECTO")}<p style="text-align:justify">${nl2br(data.alcanceProyecto)}</p>
${sec(2, "ALCANCE GENERAL Y FASES CONSTRUCTIVAS")}<p style="text-align:justify">${nl2br(data.fasesTexto)}</p>
${sec(3, "CRITERIOS DE DISEÑO Y OPERACIÓN")}<p>${nl2br(data.criterios)}</p>
${sec(4, "SUPUESTOS, LIMITACIONES Y EXCLUSIONES")}<p style="text-align:justify">${nl2br(data.supuestos)}</p>
${sec(5, "ALCANCES INCLUIDOS EN LA PROPUESTA")}<p>${nl2br(data.alcancesIncluidos)}</p>

${sec(6, "PROPUESTA ECONÓMICA — OPCIONES DE INVERSIÓN")}
<p style="text-align:justify">${esc(data.introEconomica)}</p>
<table style="width:100%">
  <tr>
    <th ${TH} style="border:1px solid #c9c9c9;padding:5pt;background:#1c27d6;color:#fff">Componente</th>
    <th ${TH} style="border:1px solid #c9c9c9;padding:5pt;background:#1c27d6;color:#fff;width:3.5cm">OPCIÓN 1<br />${esc(data.nombreOp1)}</th>
    <th ${TH} style="border:1px solid #c9c9c9;padding:5pt;background:#1c27d6;color:#fff;width:3.5cm">OPCIÓN 2<br />${esc(data.nombreOp2)}</th>
  </tr>
  ${data.componentes
    .map(
      (c) => `<tr>
    <td ${TD} style="border:1px solid #c9c9c9;padding:5pt">${esc(c.nombre)}</td>
    <td ${TD} style="border:1px solid #c9c9c9;padding:5pt;text-align:center">${c.op1 ? "Incluido" : "No incluido"}</td>
    <td ${TD} style="border:1px solid #c9c9c9;padding:5pt;text-align:center">${c.op2 ? "Incluido" : "No incluido"}</td>
  </tr>`,
    )
    .join("")}
  <tr><td ${TD} style="border:1px solid #c9c9c9;padding:5pt"><b>Subtotal (sin IVA)</b></td>
    <td ${TD} style="border:1px solid #c9c9c9;padding:5pt;text-align:center"><b>${formatQ(Number(data.subtotalOp1) || 0)}</b></td>
    <td ${TD} style="border:1px solid #c9c9c9;padding:5pt;text-align:center"><b>${formatQ(Number(data.subtotalOp2) || 0)}</b></td></tr>
  <tr><td ${TD} style="border:1px solid #c9c9c9;padding:5pt"><b>IVA 12%</b></td>
    <td ${TD} style="border:1px solid #c9c9c9;padding:5pt;text-align:center"><b>${formatQ(ivaDe(data.subtotalOp1))}</b></td>
    <td ${TD} style="border:1px solid #c9c9c9;padding:5pt;text-align:center"><b>${formatQ(ivaDe(data.subtotalOp2))}</b></td></tr>
  <tr><td ${TD} style="border:1px solid #c9c9c9;padding:5pt;background:#e8eaff"><b>PRECIO TOTAL (IVA incluido)</b></td>
    <td ${TD} style="border:1px solid #c9c9c9;padding:5pt;text-align:center;background:#e8eaff"><b>${formatQ(totalConIva(data.subtotalOp1))}</b></td>
    <td ${TD} style="border:1px solid #c9c9c9;padding:5pt;text-align:center;background:#e8eaff"><b>${formatQ(totalConIva(data.subtotalOp2))}</b></td></tr>
</table>
<p style="text-align:justify;color:#555">${nl2br(data.resumenEconomico)}</p>

${sec(7, "ANOTACIONES Y GARANTÍAS")}<p>${nl2br(data.garantiasTexto)}</p>
${sec(8, "ACEPTACIÓN Y CONDICIONES DE PAGO")}<p style="text-align:justify">${nl2br(data.condicionesPago)}</p>

${sec(9, "CRONOGRAMA GENERAL")}
<table style="width:100%">
  <tr>
    <th ${TH} style="border:1px solid #c9c9c9;padding:5pt;background:#1c27d6;color:#fff">Fase</th>
    <th ${TH} style="border:1px solid #c9c9c9;padding:5pt;background:#1c27d6;color:#fff;width:4cm">Duración</th>
  </tr>
  ${data.cronograma
    .map(
      (f) => `<tr><td ${TD} style="border:1px solid #c9c9c9;padding:5pt">${esc(f.fase)}</td>
    <td ${TD} style="border:1px solid #c9c9c9;padding:5pt;text-align:center">${esc(f.duracion)}</td></tr>`,
    )
    .join("")}
</table>
<p style="color:#555">${nl2br(data.cronogramaNota)}</p>

${data.planoTexto.trim() || data.planoDataUrl ? `<p style="color:#1c27d6;font-size:13pt;border-bottom:2px solid #1c27d6"><b>ANEXO A — PLANO DE LA PISCINA</b></p>` : ""}
${data.planoTexto.trim() ? `<p style="text-align:justify">${nl2br(data.planoTexto)}</p>` : ""}
${data.planoDataUrl ? `<p style="text-align:center"><img src="${data.planoDataUrl}" style="width:14cm" /></p>` : ""}

<p style="text-align:justify;border-top:2px solid #1c27d6;padding-top:8pt">${esc(data.cierreTexto)}</p>
<p>Atentamente,</p>
<p><b>PROYECTOS DEL AGUA PROASA S.A. — Diseño y Construcción de Piscinas</b><br />
contacto@proasa.com.gt<br />
Asesor de contacto: ${esc(data.asesor)} · Cel. ${esc(data.asesorCel)}<br />
Chiquimula, Guatemala, C.A.</p>
<p><b>Método de pago:</b><br />
Cuenta Bancaria: 2900106416 Monetaria — Proyectos del Agua S.A. (Banco Industrial)<br />
Cuenta Bancaria: 3749033281 Monetaria — Proyectos del Agua S.A. (Banrural)</p>
`;
}
