// Datos de la empresa emisora y del cliente que aparecen en las cotizaciones
// de Tienda y Empresas. Se muestran como texto (sin caja ni bordes).
// Es solo presentación; cada documento le pasa sus valores.
export type CuadroDatosProps = {
  empresaNombre: string;
  empresaNit: string;
  empresaDireccion: string;
  asesor: string;
  empresaCelular: string;
  empresaCorreo: string;
  fecha: string;
  validez: string;
  clienteNombre: string;
  clienteNit: string;
  clienteCelular: string;
  clienteCorreo: string;
};

// Si el valor está vacío, la línea (etiqueta incluida) no se muestra.
function Linea({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  if (!valor.trim()) return null;
  return (
    <p className="leading-snug">
      <span className="font-semibold">{etiqueta}:</span> {valor}
    </p>
  );
}

export function CuadroDatos(props: CuadroDatosProps) {
  return (
    <div className="cuadro-datos mb-4 text-[13px]">
      {/* Empresa emisora */}
      <div className="mb-2">
        <Linea etiqueta="Nombre de la empresa" valor={props.empresaNombre} />
        <Linea etiqueta="Nit" valor={props.empresaNit} />
        <Linea etiqueta="Dirección" valor={props.empresaDireccion} />
        <Linea etiqueta="Asesor de venta" valor={props.asesor} />
        <Linea etiqueta="Celular" valor={props.empresaCelular} />
        <Linea etiqueta="Correo" valor={props.empresaCorreo} />
        <Linea etiqueta="Fecha" valor={props.fecha} />
        <Linea etiqueta="Validez" valor={props.validez} />
      </div>
      {/* Cliente */}
      <div>
        <Linea etiqueta="Cliente" valor={props.clienteNombre} />
        <Linea etiqueta="Nit" valor={props.clienteNit} />
        <Linea etiqueta="Celular" valor={props.clienteCelular} />
        <Linea etiqueta="Correo" valor={props.clienteCorreo} />
      </div>
    </div>
  );
}
