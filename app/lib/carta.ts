export type CartaData = {
  ciudad: string;
  fecha: string;
  institucion: string;
  dependencia: string;
  evento: string;
  meses: string;
  propietario: string;
  empresa: string;
  direccion: string;
  nit: string;
  telefono: string;
  correo: string;
  firmanteEmpresa: string;
  correoFirma: string;
};

export const cartaDefaults: CartaData = {
  ciudad: "Chiquimula",
  fecha: "17 de abril de 2026",
  institucion: "INSTITUTO GUATEMALTECO DE SEGURIDAD SOCIAL – IGSS",
  dependencia: "Hospital de Gineco Obstetricia",
  evento: "30017866",
  meses: "24",
  propietario: "César Eduardo Regalado Salguero",
  empresa: "PROMESA, de Aquaequipos",
  direccion: "8va Avenida lote 17 zona 2, Chiquimula",
  nit: "1654601-6",
  telefono: "4004-5414",
  correo: "Eregalado@aquaequipos.com",
  firmanteEmpresa: "PROMESA / AQUAEQUIPOS",
  correoFirma: "cesarregalado@aquaequipos.com",
};

// Etiquetas y agrupación de los campos del formulario.
export const cartaFields: {
  group: string;
  fields: { name: keyof CartaData; label: string }[];
}[] = [
  {
    group: "Encabezado",
    fields: [
      { name: "ciudad", label: "Ciudad" },
      { name: "fecha", label: "Fecha" },
    ],
  },
  {
    group: "Destinatario",
    fields: [
      { name: "institucion", label: "Institución" },
      { name: "dependencia", label: "Dependencia" },
    ],
  },
  {
    group: "Evento y garantía",
    fields: [
      { name: "evento", label: "Evento No." },
      { name: "meses", label: "Meses de garantía" },
    ],
  },
  {
    group: "Datos de la empresa",
    fields: [
      { name: "propietario", label: "Propietario" },
      { name: "empresa", label: "Empresa" },
      { name: "direccion", label: "Dirección fiscal" },
      { name: "nit", label: "NIT" },
      { name: "telefono", label: "Teléfono" },
      { name: "correo", label: "Correo de contacto" },
    ],
  },
  {
    group: "Firma",
    fields: [
      { name: "firmanteEmpresa", label: "Empresa (firma)" },
      { name: "correoFirma", label: "Correo (firma)" },
    ],
  },
];
