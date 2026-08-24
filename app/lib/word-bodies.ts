// Cuerpos de documento como elementos Word nativos (párrafos y tablas `docx`).
// Antes se generaba HTML que Word reinterpretaba; ahora se construye OOXML real
// para que los formatos (anchos, sombreado, bordes) queden bien en la hoja.

import type { Paragraph, Table } from "docx";
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
import { ivaDe, totalConIva, type PropuestaPiscinaData } from "./propuesta-piscina";
import {
  bloqueDatos,
  cm,
  imagenCm,
  par,
  parLineas,
  seccionTitulo,
  t,
  tabla,
  vinieta,
  type Celda,
} from "./word-kit";

type Elem = Paragraph | Table;

const AZUL = "0098FF";
const AZUL_OSC = "0027A5";
const AZUL_CLARO = "D5ECFD";
const GRIS = "C9C9C9";
const FIRMA = "/selloyfirma.png";

// Fila de encabezado de tabla (texto centrado y en negrita, con relleno).
function th(text: string, fill: string, color = "FFFFFF", align: Celda["align"] = "center"): Celda {
  return { text, bold: true, fill, color, align };
}

// ---------- Empresas ----------
export async function wordBodyEmpresas(
  data: CotizacionPrivadaData,
  numero: string,
): Promise<Elem[]> {
  const items = data.items.filter((i) => i.descripcion.trim() || i.cantidad.trim());
  const total = totalGeneral(items);
  const out: Elem[] = [];

  out.push(par([t(`Cotización No. ${numero}`, { bold: true })], { align: "right" }));

  out.push(
    bloqueDatos([
      ["Nombre de la empresa", data.empresaNombre],
      ["Nit", data.empresaNit],
      ["Dirección", data.empresaDireccion],
      ["Asesor de venta", data.asesorNombre],
      ["Celular", data.asesorTelefono],
      ["Correo", data.asesorCorreo],
      ["Fecha", data.fecha],
      ["Validez", data.validez],
    ]),
  );
  out.push(
    bloqueDatos([
      ["Cliente", data.clienteNombre],
      ["Nit", data.clienteNit],
      ["Celular", data.clienteCelular],
      ["Correo", data.clienteCorreo],
    ]),
  );

  if (data.clienteNombre?.trim()) {
    out.push(
      par([
        t("Sres."),
        t(data.clienteNombre, { bold: true, break: 1 }),
        t("Pte.", { break: 1 }),
      ]),
    );
  }
  out.push(
    par(
      [
        t(
          `En atención a su solicitud presento la siguiente oferta económica${
            data.concepto?.trim() ? ` para ${data.concepto}` : ""
          }:`,
        ),
      ],
      { align: "justify", indent: cm(1) },
    ),
  );

  const filas: Celda[][] = [
    [th("Cantidad", "FFFFFF", "000000"), th("Descripción", "FFFFFF", "000000"), th("Precio Unidad", "FFFFFF", "000000"), th("Total", "FFFFFF", "000000")],
  ];
  for (const it of items) {
    filas.push([
      { text: it.cantidad, align: "center" },
      { text: it.descripcion, align: "left" },
      { text: formatQ(parseNum(it.precioUnidad)), align: "right" },
      { text: formatQ(totalItem(it)), align: "right" },
    ]);
  }
  out.push(tabla([12, 58, 15, 15], filas));

  out.push(par([t(`TOTAL    ${formatQ(total)}`, { bold: true })], { align: "right" }));
  out.push(
    par(
      [t("Total", { bold: true, underline: true }), t(` en letras: ${quetzalesEnLetras(total)}`)],
      { align: "right" },
    ),
  );

  out.push(par([t("Observaciones:", { bold: true })]));
  for (const o of data.observaciones.filter((o) => o.trim())) out.push(vinieta(o));

  out.push(par(["En espera de su respuesta atentamente:"]));
  const firma = await imagenCm(FIRMA, 5.5, "right");
  if (firma) out.push(firma);
  out.push(
    parLineas(
      `César Eduardo Regalado Salguero\nPropietario\nContacto: ${data.asesorNombre} ${data.asesorTelefono}`,
      { align: "right" },
    ),
  );
  return out;
}

// ---------- Tienda ----------
export async function wordBodyTienda(
  data: CotizacionTiendaData,
  numero: string,
): Promise<Elem[]> {
  const items = data.items.filter((i) => i.descripcion.trim() || i.precio.trim());
  const subtotal = subtotalTienda(items);
  const total = totalTienda(items, data.otros);
  const out: Elem[] = [];

  out.push(par([t("COTIZACIÓN", { bold: true, color: AZUL, size: 36 })], { align: "right", after: 40 }));
  out.push(par([t(`Cotización No. ${numero}`, { bold: true })], { align: "right" }));

  out.push(
    bloqueDatos([
      ["Nombre de la empresa", data.empresaNombre],
      ["Nit", data.empresaNit],
      ["Dirección", data.empresaDireccion],
      ["Asesor de venta", data.asesor],
      ["Celular", data.empresaCelular],
      ["Correo", data.empresaCorreo],
      ["Fecha", data.fecha],
      ["Validez", data.validez],
    ]),
  );
  out.push(
    bloqueDatos([
      ["Cliente", data.cliente],
      ["Nit", data.nitCliente],
      ["Celular", data.clienteCelular],
      ["Correo", data.clienteCorreo],
    ]),
  );

  const filas: Celda[][] = [
    [th("DESCRIPCION", AZUL, "FFFFFF", "left"), th("Precio", AZUL), th("Cantidad", AZUL), th("Unidad", AZUL), th("TOTAL", AZUL)],
  ];
  for (const it of items) {
    filas.push([
      { text: it.descripcion, align: "left" },
      { text: formatQ(parseNum(it.precio)), align: "right" },
      { text: it.cantidad, align: "center" },
      { text: it.unidad, align: "center" },
      { text: formatQ(totalItemTienda(it)), align: "right" },
    ]);
  }
  out.push(tabla([44, 15, 13, 13, 15], filas));

  // Términos (izquierda) + totales (derecha), lado a lado, sin bordes.
  const terminos: Paragraph[] = [
    par([t("TÉRMINOS Y CONDICIONES", { bold: true, color: "FFFFFF" })], { shading: AZUL, after: 60 }),
    ...data.terminos.filter((x) => x.trim()).map((x) => par([t(x)], { after: 40 })),
  ];
  const totales = tabla(
    [58, 42],
    [
      [{ text: "Subtotal", align: "right" }, { text: formatQ(subtotal), align: "right" }],
      [{ text: "Otros", align: "right" }, { text: formatQ(parseNum(data.otros)), align: "right" }],
      [
        { runs: [t("TOTAL", { bold: true })], align: "right" },
        { runs: [t(formatQ(total), { bold: true })], align: "right", fill: AZUL_CLARO },
      ],
    ],
    { borde: "none" },
  );
  out.push(
    tabla([60, 40], [[{ children: terminos }, { children: [totales] }]], { borde: "none" }),
  );

  out.push(
    par([t("Si usted tiene alguna pregunta sobre esta cotización, por favor, póngase en contacto con nosotros", { color: "555555" })], { align: "center", before: 160 }),
  );

  const firma = await imagenCm(FIRMA, 5.5, "right");
  if (firma) out.push(firma);
  out.push(parLineas("César Eduardo Regalado Salguero\nPropietario", { align: "right" }));
  return out;
}

// ---------- Guatecompras ----------
export async function wordBodyGuatecompras(
  data: CotizacionGuatecomprasData,
): Promise<Elem[]> {
  const items = data.items.filter((i) => i.descripcion.trim() || i.cantidad.trim());
  const total = totalGeneral(items);
  const out: Elem[] = [];

  out.push(
    par([
      t("Fecha: ", { bold: true }),
      t(data.fecha),
      t("Número de Operación de Guatecompras: ", { bold: true, break: 1 }),
      t(data.numeroOperacion, { bold: true }),
      t("Cotización a: ", { bold: true, break: 1 }),
      t(data.cotizacionA, { bold: true }),
      t("Dirigida a: ", { bold: true, break: 1 }),
      t(data.dirigidaA),
      t("Dirección: ", { bold: true, break: 1 }),
      t(data.direccion),
      t("Nombre de la empresa: ", { bold: true, break: 1 }),
      t(data.empresaNombre, { bold: true }),
      t("Razón Social: ", { bold: true, break: 1 }),
      t(data.razonSocial, { bold: true }),
      t("Dirección fiscal de la empresa: ", { bold: true, break: 1 }),
      t(`${data.empresaDireccion} `),
      t("Nit: ", { bold: true }),
      t(data.empresaNit),
      t("Régimen: ", { bold: true, break: 1 }),
      t(`${data.regimen} `),
      t("Número de teléfono: ", { bold: true }),
      t(data.telefono),
      t("Correo electrónico: ", { bold: true, break: 1 }),
      t(data.correo1),
      t("Correo electrónico 2: ", { bold: true, break: 1 }),
      t(data.correo2),
    ]),
  );

  out.push(parLineas("Pte.\nEn atención a su solicitud presento la siguiente oferta ECONOMICA:"));

  const filas: Celda[][] = [
    [th("Descripción", "FFFFFF", "000000"), th("Cantidad", "FFFFFF", "000000"), th("Precio Unitario", "FFFFFF", "000000"), th("Total", "FFFFFF", "000000")],
  ];
  for (const it of items) {
    filas.push([
      { text: it.descripcion, align: "left" },
      { text: it.cantidad, align: "center" },
      { text: formatQ(parseNum(it.precioUnidad)), align: "right" },
      { text: formatQ(totalItem(it)), align: "right" },
    ]);
  }
  filas.push([
    { runs: [t("Total", { bold: true })] },
    { text: "" },
    { text: "" },
    { runs: [t(formatQ(total), { bold: true })], align: "right" },
  ]);
  out.push(tabla([55, 13, 16, 16], filas));

  out.push(
    par([t("TOTAL EN LETRAS: ", { bold: true, underline: true }), t(quetzalesEnLetras(total), { bold: true })]),
  );

  out.push(par([t("Observaciones:", { bold: true })]));
  for (const o of data.observaciones.filter((o) => o.trim())) out.push(vinieta(o));

  out.push(par(["En espera de su respuesta atentamente:"]));
  const firma = await imagenCm(FIRMA, 5.5, "left");
  if (firma) out.push(firma);
  out.push(parLineas(`César Eduardo Regalado\nPropietario\nCel: ${data.telefono}`));
  return out;
}

// ---------- Carta de Garantía ----------
export async function wordBodyCarta(data: CartaData): Promise<Elem[]> {
  const out: Elem[] = [];
  out.push(par([t(`${data.ciudad}, ${data.fecha}`)]));
  out.push(
    par([
      t("Señores:"),
      t(data.institucion, { bold: true, break: 1 }),
      ...(data.dependencia ? [t(data.dependencia, { bold: true, break: 1 })] : []),
      t("Presente", { break: 1 }),
    ]),
  );
  out.push(par([t("Asunto: ", { bold: true }), t("Carta de Garantía – Evento No. "), t(data.evento, { bold: true })]));
  out.push(par(["Estimados señores:"]));
  out.push(
    par(
      [
        t(
          `Por medio de la presente, yo, ${data.propietario}, en calidad de propietario de la empresa ${data.empresa}, con dirección fiscal en ${data.direccion}, NIT: ${data.nit}, teléfono ${data.telefono} y correo electrónico ${data.correo}, hago constar lo siguiente:`,
        ),
      ],
      { align: "justify", indent: cm(1) },
    ),
  );
  out.push(
    par(
      [
        t("Que, en caso de ser adjudicados en el evento No. "),
        t(data.evento, { bold: true }),
        t(", correspondiente a la cotización realizada al "),
        t(data.institucion, { bold: true }),
        t(`, nos comprometemos a otorgar una garantía de ${data.meses} meses sobre los equipos suministrados y los trabajos realizados.`),
      ],
      { align: "justify" },
    ),
  );
  out.push(
    par(
      ["Esta garantía cubrirá cualquier desperfecto de fabricación, fallas en los equipos instalados o inconvenientes derivados de la correcta ejecución del servicio, siempre que estos no sean ocasionados por mal uso, negligencia, intervenciones no autorizadas o factores externos fuera de nuestro control como desastres naturales."],
      { align: "justify" },
    ),
  );
  out.push(par(["Sin otro particular, quedamos a su disposición."], { align: "justify" }));
  out.push(par(["Atentamente,"]));
  const firma = await imagenCm(FIRMA, 5.5, "left");
  if (firma) out.push(firma);
  out.push(
    parLineas(
      `${data.propietario}\nPropietario\n${data.firmanteEmpresa}\nTel: ${data.telefono}\nCorreo: ${data.correoFirma}`,
    ),
  );
  return out;
}

// ---------- Piscina (PROASA) ----------
export async function wordBodyPiscina(data: PropuestaPiscinaData): Promise<Elem[]> {
  const out: Elem[] = [];

  // Encabezado: logo a la izquierda, web a la derecha.
  const logo = await imagenCm("/proasalogo.png", 3, "left");
  out.push(
    tabla(
      [50, 50],
      [
        [
          { children: logo ? [logo] : [par([""])] },
          { runs: [t("www.proasa.com.gt", { color: "555555" })], align: "right" },
        ],
      ],
      { borde: "none" },
    ),
  );

  out.push(par([t("PROPUESTA TÉCNICA Y ECONÓMICA", { bold: true, color: AZUL_OSC })], { after: 40 }));
  out.push(par([t(data.titulo, { bold: true, size: 36 })], { after: 40 }));
  out.push(par([t(data.subtitulo, { color: "555555" })]));
  out.push(par([t(data.descripcion)], { align: "justify" }));

  out.push(
    tabla(
      [30, 70],
      [
        [{ runs: [t("Cliente", { bold: true })] }, { text: data.cliente }],
        [{ runs: [t("Ubicación", { bold: true })] }, { text: data.ubicacion }],
        [{ runs: [t("Fecha de emisión", { bold: true })] }, { text: data.fechaEmision }],
        [{ runs: [t("Vigencia de la oferta", { bold: true })] }, { text: data.vigencia }],
        [{ runs: [t("Modalidad", { bold: true })] }, { text: data.modalidad }],
      ],
      { borde: GRIS },
    ),
  );

  out.push(seccionTitulo(1, "ALCANCE DEL PROYECTO"));
  out.push(parLineas(data.alcanceProyecto, { align: "justify" }));
  out.push(seccionTitulo(2, "ALCANCE GENERAL Y FASES CONSTRUCTIVAS"));
  out.push(parLineas(data.fasesTexto, { align: "justify" }));
  out.push(seccionTitulo(3, "CRITERIOS DE DISEÑO Y OPERACIÓN"));
  out.push(parLineas(data.criterios));
  out.push(seccionTitulo(4, "SUPUESTOS, LIMITACIONES Y EXCLUSIONES"));
  out.push(parLineas(data.supuestos, { align: "justify" }));
  out.push(seccionTitulo(5, "ALCANCES INCLUIDOS EN LA PROPUESTA"));
  out.push(parLineas(data.alcancesIncluidos));

  out.push(seccionTitulo(6, "PROPUESTA ECONÓMICA — OPCIONES DE INVERSIÓN"));
  out.push(par([t(data.introEconomica)], { align: "justify" }));

  const filasEco: Celda[][] = [
    [
      th("Componente", AZUL_OSC),
      { runs: [t(`OPCIÓN 1`, { bold: true, color: "FFFFFF" }), t(data.nombreOp1, { color: "FFFFFF", break: 1 })], fill: AZUL_OSC, align: "center" },
      { runs: [t(`OPCIÓN 2`, { bold: true, color: "FFFFFF" }), t(data.nombreOp2, { color: "FFFFFF", break: 1 })], fill: AZUL_OSC, align: "center" },
    ],
  ];
  for (const c of data.componentes) {
    filasEco.push([
      { text: c.nombre, align: "left" },
      { text: c.op1 ? "Incluido" : "No incluido", align: "center" },
      { text: c.op2 ? "Incluido" : "No incluido", align: "center" },
    ]);
  }
  filasEco.push([
    { runs: [t("Subtotal (sin IVA)", { bold: true })] },
    { runs: [t(formatQ(Number(data.subtotalOp1) || 0), { bold: true })], align: "center" },
    { runs: [t(formatQ(Number(data.subtotalOp2) || 0), { bold: true })], align: "center" },
  ]);
  filasEco.push([
    { runs: [t("IVA 12%", { bold: true })] },
    { runs: [t(formatQ(ivaDe(data.subtotalOp1)), { bold: true })], align: "center" },
    { runs: [t(formatQ(ivaDe(data.subtotalOp2)), { bold: true })], align: "center" },
  ]);
  filasEco.push([
    { runs: [t("PRECIO TOTAL (IVA incluido)", { bold: true })], fill: AZUL_CLARO },
    { runs: [t(formatQ(totalConIva(data.subtotalOp1)), { bold: true })], align: "center", fill: AZUL_CLARO },
    { runs: [t(formatQ(totalConIva(data.subtotalOp2)), { bold: true })], align: "center", fill: AZUL_CLARO },
  ]);
  out.push(tabla([50, 25, 25], filasEco, { borde: GRIS }));
  out.push(parLineas(data.resumenEconomico, { align: "justify", color: "555555" }));

  out.push(seccionTitulo(7, "ANOTACIONES Y GARANTÍAS"));
  out.push(parLineas(data.garantiasTexto));
  out.push(seccionTitulo(8, "ACEPTACIÓN Y CONDICIONES DE PAGO"));
  out.push(parLineas(data.condicionesPago, { align: "justify" }));

  out.push(seccionTitulo(9, "CRONOGRAMA GENERAL"));
  const filasCrono: Celda[][] = [[th("Fase", AZUL_OSC), th("Duración", AZUL_OSC)]];
  for (const f of data.cronograma) {
    filasCrono.push([
      { text: f.fase, align: "left" },
      { text: f.duracion, align: "center" },
    ]);
  }
  out.push(tabla([70, 30], filasCrono, { borde: GRIS }));
  out.push(parLineas(data.cronogramaNota, { color: "555555" }));

  if (data.planoTexto.trim() || data.planoDataUrl) {
    out.push(seccionTitulo("ANEXO A", "PLANO DE LA PISCINA"));
  }
  if (data.planoTexto.trim()) out.push(parLineas(data.planoTexto, { align: "justify" }));
  if (data.planoDataUrl) {
    const plano = await imagenCm(data.planoDataUrl, 14, "center");
    if (plano) out.push(plano);
  }

  out.push(par([t(data.cierreTexto)], { align: "justify", before: 160 }));
  out.push(par(["Atentamente,"]));
  out.push(
    parLineas(
      "PROYECTOS DEL AGUA PROASA S.A. — Diseño y Construcción de Piscinas\ncontacto@proasa.com.gt\nAsesor de contacto: " +
        `${data.asesor} · Cel. ${data.asesorCel}\nChiquimula, Guatemala, C.A.`,
      { bold: false },
    ),
  );
  out.push(
    parLineas(
      "Método de pago:\nCuenta Bancaria: 2900106416 Monetaria — Proyectos del Agua S.A. (Banco Industrial)\nCuenta Bancaria: 3749033281 Monetaria — Proyectos del Agua S.A. (Banrural)",
    ),
  );
  return out;
}
