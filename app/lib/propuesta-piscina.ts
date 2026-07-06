import { parseNum } from "./cotizacion-privada";

export type ComponenteTabla = { nombre: string; op1: boolean; op2: boolean };
export type FilaCronograma = { fase: string; duracion: string };

export type PropuestaPiscinaData = {
  // Portada
  titulo: string;
  subtitulo: string;
  descripcion: string;
  cliente: string;
  ubicacion: string;
  fechaEmision: string;
  vigencia: string;
  modalidad: string;
  // Secciones de texto (editables)
  alcanceProyecto: string;
  fasesTexto: string;
  criterios: string;
  supuestos: string;
  alcancesIncluidos: string;
  // Económica
  introEconomica: string;
  nombreOp1: string;
  nombreOp2: string;
  componentes: ComponenteTabla[];
  subtotalOp1: string;
  subtotalOp2: string;
  resumenEconomico: string;
  // Garantías / pago / cronograma
  garantiasTexto: string;
  condicionesPago: string;
  cronograma: FilaCronograma[];
  cronogramaNota: string;
  // Anexo A — plano
  planoTexto: string;
  planoDataUrl: string; // imagen del plano (data URL) o ""
  // Cierre
  cierreTexto: string;
  asesor: string;
  asesorCel: string;
};

export const IVA_RATE = 0.12;
export function ivaDe(subtotal: string): number {
  return parseNum(subtotal) * IVA_RATE;
}
export function totalConIva(subtotal: string): number {
  return parseNum(subtotal) * (1 + IVA_RATE);
}

export const piscinaDefaults: PropuestaPiscinaData = {
  titulo: "CONSTRUCCIÓN DE PISCINA DESBORDANTE",
  subtitulo:
    "Piscina desbordante perimetral con tanque de compensación · 3.00 × 5.00 m — Chiquimula, Guatemala",
  descripcion:
    "Construcción de una piscina desbordante perimetral (rebosadero oculto en 3 lados, a ras de piso) de 3.00 × 5.00 m con tanque de compensación, profundidad variable de 1.10 a 1.60 m, acabado de porcelanato antideslizante, iluminación LED, cloración salina y cuarto de equipos. Se presenta en dos opciones de inversión: estándar premium o completa de lujo con climatización.",
  cliente: "Heidy de Castañeda",
  ubicacion: "Chiquimula, departamento de Chiquimula, Guatemala",
  fechaEmision: "19 de junio de 2026",
  vigencia: "19 de agosto de 2026",
  modalidad:
    "Ejecución continua o por fases independientes, según disponibilidad del cliente",

  alcanceProyecto:
    "Construir y entregar en operación una piscina desbordante perimetral en Chiquimula, Guatemala. La piscina es de 3.00 × 5.00 metros con profundidad variable de 1.10 a 1.60 m (15.00 m² de espejo de agua y un volumen aproximado de 20.25 m³). El sistema desbordante mantiene el agua a ras del piso (nivel deck) y la hace rebosar de forma continua por una ranura disimulada en tres de sus lados, que la conduce por un canal perimetral oculto hacia un tanque de compensación, desde donde se recircula y se devuelve a la piscina, manteniendo un nivel impecable y constante y el característico efecto de espejo de agua continuo. El lado de la escalinata a lo ancho funciona como acceso y no desborda.\n\nEl proyecto contempla los trabajos preliminares, el trazo y la excavación; la estructura de concreto armado con concreto premezclado fluido de 4,000 PSI e impermeabilización integral; el tanque de compensación; el sistema hidráulico completo con tubería de presión, retornos, succión de fondo con rejilla de seguridad, el rebosadero perimetral oculto (en tres lados) e iluminación LED subacuática; el acabado interior con porcelanato antideslizante y la coronación perimetral; y la construcción y equipamiento del cuarto de equipos.\n\nLa propuesta se presenta en dos opciones de inversión: la Opción 1 (completa de lujo) incorpora además climatización del agua por bomba de calor y automatización del sistema; la Opción 2 (estándar premium) entrega la misma piscina sin climatización ni automatización. El sistema de rebosadero perimetral y el tanque de compensación se mantienen en ambas opciones.",

  fasesTexto:
    "El alcance técnico se organiza por fases constructivas. Cada fase incluye suministro de mano de obra calificada, herramienta y equipo, materiales y supervisión técnica especializada hasta la entrega operativa. Memoria de cálculo: espejo de agua de 15.00 m², volumen aproximado de 20.25 m³ (más el volumen del tanque de compensación), superficie a revestir con porcelanato ~42 m², coronación perimetral ~16 ml y canal perimetral de rebose (oculto, en 3 lados) ~13 ml.\n\nFASE 1 — Trabajos Preliminares, Trazo y Excavación\nIncluye: Limpieza y nivelación del terreno, trazo y replanteo del vaso y del tanque de compensación conforme al plano, excavación de los vasos y taludes, retiro y disposición del material excavado, y conformación y compactación del fondo y taludes.\nObjetivo: Entregar el terreno trazado, excavado a niveles de proyecto y compactado, listo para el armado estructural.\n\nFASE 2 — Estructura del Vaso y Tanque de Compensación (Concreto Armado 4,000 PSI)\nIncluye: Acero de refuerzo grado 40 en fondo y muros, formaleta y fundición de losa de fondo y muros con concreto premezclado fluido de 4,000 PSI. Incluye la coronación perimetral calibrada a nivel láser para el rebosadero oculto (en tres lados), el vaso del tanque de compensación, gradas de acceso a lo ancho, curado, resanes e impermeabilización integral.\nObjetivo: Entregar la estructura fundida, curada, resanada e impermeabilizada, hermética y lista para el acabado.\n\nFASE 3 — Sistema Hidráulico, Rebosadero Perimetral e Iluminación\nIncluye: Red de tubería PVC de presión 250 psi (retornos y succión de fondo con rejilla antiatrapamiento) con zanjeo, accesorios y válvulas hasta el cuarto de equipos; rebosadero perimetral oculto con canal y rejilla a ras de piso en tres lados, conexión al tanque de compensación y bomba dedicada; luces LED subacuáticas con nichos, transformador y cableado; pruebas de presión y sello.\nObjetivo: Dotar a la piscina de una red hidráulica completa, probada y hermética, con el rebosadero perimetral y la iluminación instalados.\n\nFASE 4 — Acabado Interior con Porcelanato y Coronación\nIncluye: Repello fino y afinado impermeable de base (~42 m²), suministro y colocación de porcelanato antideslizante apto para piscinas con adhesivo y fragua epóxica, y coronación o brocal perimetral con pieza de remate (~16 ml), incluido el remate y la rejilla oculta del rebosadero perimetral.\nObjetivo: Entregar el interior revestido con porcelanato uniforme, sellado y con la coronación instalada.\n\nFASE 5 — Cuarto de Equipos: Obra Civil y Equipamiento\nIncluye: Obra civil del cuarto de equipos con muros, losa, ventilación y drenaje; y su equipamiento: bomba de recirculación dimensionada al volumen, bomba dedicada para el rebosadero perimetral, filtro de arena con válvula multipuerto y carga de arena sílica, sistema de cloración salina, tablero de control y protección eléctrica, e hidráulica completa interconectada con la red.\nObjetivo: Entregar el cuarto de equipos construido y equipado, instalado, calibrado y probado.\n\nFASE 6 — Pruebas y Puesta en Marcha\nIncluye: Verificación de estanqueidad, llenado, balanceo químico inicial con químicos de arranque, calibración del rebosadero perimetral, ajuste del sistema de bombeo y filtración, capacitación básica y entrega formal.\nObjetivo: Entregar la piscina en operación, balanceada, con el rebosadero perimetral calibrado y el cliente capacitado.\n\nComponentes de la Opción 1 (Completa de Lujo) — se incluyen únicamente en la Opción 1:\n• Climatización del agua mediante bomba de calor, dimensionada al volumen de la piscina, con su hidráulica y conexión eléctrica.\n• Automatización del sistema: control de filtración, iluminación y temperatura desde tablero/aplicación.",

  criterios:
    "• Estructura de concreto armado con concreto premezclado fluido de 4,000 PSI.\n• Impermeabilización integral del vaso y del tanque de compensación con sistema de alta adherencia previo al acabado.\n• Rebosadero perimetral oculto (desbordante en 3 lados, agua a ras de piso) con coronación calibrada a nivel láser y canal perimetral con rejilla, conectado al tanque de compensación.\n• Tanque de compensación dimensionado para absorber el volumen de rebose y estabilizar el nivel de operación.\n• Red hidráulica en tubería de PVC de presión 250 psi, dimensionada para el volumen y el equipo de bombeo.\n• Doble bombeo: bomba de recirculación/filtración y bomba dedicada al rebosadero perimetral.\n• Sanitización mediante sistema de cloración salina de bajo mantenimiento.\n• Iluminación LED subacuática de bajo consumo con transformador a voltaje seguro.\n• Acabado interior con porcelanato antideslizante apto para piscinas, con adhesivo y fragua epóxica.\n• Pruebas de presión y estanqueidad de la red previo al acabado.",

  supuestos:
    "Supuestos:\nTerreno con acceso disponible; suelo con capacidad portante apta (sin cimentaciones especiales ocultas); agua potable y energía eléctrica disponibles en sitio; punto de desfogue para el drenaje; y área para maniobra y acopio de materiales.\n\nLimitaciones:\nCondiciones del subsuelo distintas a las previstas (roca, nivel freático alto, relleno o suelo de baja capacidad) que se identifiquen durante la excavación, así como cambios solicitados por el cliente durante la ejecución, podrán requerir ajustes mediante orden de cambio formal.\n\nExclusiones — la presente propuesta NO incluye:\n• En la Opción 2 se excluyen la climatización por bomba de calor y la automatización; el rebosadero perimetral y el tanque de compensación se mantienen en ambas opciones.\n• Construcción de rancho, pérgola, terraza exterior o área de camastros (puede cotizarse por separado).\n• Jardinería, mobiliario de piscina y obra civil fuera del perímetro inmediato de la piscina.\n• Conexiones de acometidas externas (agua potable, energía eléctrica y drenaje desde la red).\n• Costo del agua del primer llenado.\n• Cualquier trabajo adicional no descrito será cotizado mediante solicitud expresa.",

  alcancesIncluidos:
    "• Supervisión técnica especializada durante toda la ejecución.\n• Mano de obra calificada, herramienta, equipo y materiales completos para todas las fases.\n• Trazo, excavación, estructura de concreto armado 4,000 PSI, curado, resanes e impermeabilización integral del vaso y del tanque de compensación.\n• Sistema de rebosadero perimetral oculto (3 lados) con canal perimetral, tanque de compensación y bomba dedicada.\n• Red hidráulica nueva en PVC 250 psi con válvulas y accesorios conectada al cuarto de equipos.\n• Acabado interior con porcelanato antideslizante (~42 m²) y coronación perimetral (~16 ml).\n• Cuarto de equipos: obra civil + bomba de recirculación, bomba de rebosadero perimetral, filtro de arena, cloración salina, tablero de control e hidráulica completa.\n• Iluminación LED subacuática.\n• En la Opción 1: climatización por bomba de calor y automatización del sistema.\n• Químicos iniciales, pruebas funcionales, puesta en marcha y capacitación básica.",

  introEconomica:
    "La propuesta se ofrece como precio cerrado (paquete) en dos opciones. Todos los valores están expresados en Quetzales (GTQ) e incluyen IVA del 12 %. El cuadro siguiente detalla los componentes incluidos en cada opción.",
  nombreOp1: "Completa de lujo",
  nombreOp2: "Estándar premium",
  componentes: [
    { nombre: "Vaso de piscina desbordante 3.00 × 5.00 m (prof. 1.10–1.60 m)", op1: true, op2: true },
    { nombre: "Tanque de compensación dimensionado al volumen de rebose", op1: true, op2: true },
    { nombre: "Estructura de concreto armado 4,000 PSI e impermeabilización integral", op1: true, op2: true },
    { nombre: "Rebosadero perimetral oculto en 3 lados (canal + bomba dedicada)", op1: true, op2: true },
    { nombre: "Acabado interior de porcelanato antideslizante y coronación perimetral", op1: true, op2: true },
    { nombre: "Filtración, recirculación y sistema de cloración salina", op1: true, op2: true },
    { nombre: "Iluminación LED subacuática", op1: true, op2: true },
    { nombre: "Cuarto de equipos (obra civil + equipamiento e hidráulica)", op1: true, op2: true },
    { nombre: "Climatización por bomba de calor", op1: true, op2: false },
    { nombre: "Automatización (control de filtración, luces y temperatura)", op1: true, op2: false },
  ],
  subtotalOp1: "277600",
  subtotalOp2: "225600",
  resumenEconomico:
    "Según lo conversado, la Opción 2 (estándar premium) es la configuración recomendada para este proyecto. Los valores corresponden a precios vigentes a la fecha de esta cotización y podrán ajustarse por variación de costos de materiales. Se sugiere prever un incremento aproximado del 5 % por efectos inflacionarios durante el período de ejecución. Una vez definidos los acabados (tipo y calidad de porcelanato, piezas de coronación, luminarias y equipos) se confirma el precio final mediante adenda.",

  garantiasTexto:
    "• Todos los precios están expresados en Quetzales (GTQ) e incluyen IVA del 12 %.\n• El precio puede variar según los acabados que el cliente seleccione (porcelanato, coronación, luminarias y equipos); el precio final se confirma una vez definidos los acabados.\n• Tiempo estimado de ejecución continua: Opción 2 ~75 días calendario; la Opción 1 (con climatización y automatización) agrega aproximadamente 1 a 2 semanas.\n\nGarantías:\n• Estructura del vaso y tanque de compensación (concreto armado e impermeabilización): 5 años contra filtraciones por defectos constructivos.\n• Red hidráulica y accesorios instalados: 5 años contra fugas por defectos de instalación.\n• Acabado de porcelanato: 2 años contra desprendimientos por defectos de colocación.\n• Sistema de rebosadero perimetral y coronación: 2 años contra defectos constructivos.\n• Equipos de bombeo, filtración, climatización, cloración salina y tablero de control: 12 meses contra defectos de fabricación.\n• La garantía no cubre fallas por operación fuera de parámetros, falta de mantenimiento, uso indebido o manipulación por terceros.",

  condicionesPago:
    "Para la aceptación se requiere la firma del contrato y/o carta de aceptación a nombre de PROYECTOS DEL AGUA PROASA S.A., indicando la opción elegida (1 o 2), enviada al correo contacto@proasa.com.gt o al WhatsApp del asesor.\n\nCondiciones de pago:\n• 50 % de anticipo a la firma para programación e inicio de los trabajos.\n• Pagos parciales contra avance por fases, con acta de recepción parcial firmada.\n• El saldo final contra entrega y puesta en marcha del proyecto.\n• Los equipos (climatización, bombas y rebosadero perimetral) requieren anticipo para la colocación de la orden de compra.",

  cronograma: [
    { fase: "FASE 1 — Preliminares, Trazo y Excavación", duracion: "1 semana" },
    { fase: "FASE 2 — Estructura del Vaso y Tanque de Compensación", duracion: "3 semanas" },
    { fase: "FASE 3 — Sistema Hidráulico, Rebosadero Perimetral e Iluminación", duracion: "2 semanas" },
    { fase: "FASE 4 — Acabado de Porcelanato y Coronación", duracion: "2.5 semanas" },
    { fase: "FASE 5 — Cuarto de Equipos (paralelo)", duracion: "1.5 semanas*" },
    { fase: "FASE 6 — Llenado, Pruebas y Puesta en Marcha", duracion: "1 semana" },
    { fase: "Opción 1: Climatización y automatización", duracion: "1 a 2 semanas" },
  ],
  cronogramaNota:
    "En ejecución continua, la Opción 2 se estima en aproximadamente 75 días calendario (~11 semanas) y la Opción 1 en aproximadamente 85 a 90 días calendario, ejecutando en paralelo el cuarto de equipos con los trabajos del vaso. * La Fase 5 no incluye el tiempo de entrega de equipos por el proveedor (típicamente 3 a 6 semanas desde la orden de compra).",

  planoTexto:
    "Planta esquemática y corte A-A' de la piscina desbordante: vaso de 3.00 × 5.00 m con rebosadero perimetral oculto en tres lados (canal con rejilla a ras de piso), que conduce el agua a un tanque de compensación y al cuarto de equipos. El fondo presenta pendiente continua de 1.10 m (lado de las gradas) a 1.60 m (lado opuesto). Las gradas de acceso son a lo ancho (escalinata a todo el ancho de 3.00 m); este lado funciona como acceso y no desborda. Plano no a escala, sujeto a verificación y replanteo en sitio.",
  planoDataUrl: "",
  cierreTexto:
    "Agradecemos la oportunidad de presentar esta propuesta. Quedamos atentos a sus comentarios, validaciones o aprobación para dar inicio a las actividades correspondientes.",
  asesor: "Eduardo Regalado",
  asesorCel: "+502 4004-5414",
};
