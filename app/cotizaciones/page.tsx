import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import { listTienda } from "../lib/store-tienda";
import { listPrivadas, peekNextNumero } from "../lib/store-privadas";
import {
  CotizacionesSwitcher,
  type Formato,
} from "../components/cotizaciones-switcher";

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; formato?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [tienda, empresas, siguienteNumero] = await Promise.all([
    listTienda(),
    listPrivadas(),
    peekNextNumero(),
  ]);

  const { id, formato } = await searchParams;
  const inicial: Formato = formato === "empresas" ? "empresas" : "tienda";

  return (
    <CotizacionesSwitcher
      tienda={tienda}
      empresas={empresas}
      siguienteNumero={siguienteNumero}
      userEmail={session.email}
      initialFormato={inicial}
      initialSelectedId={id}
    />
  );
}
