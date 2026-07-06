import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import { listTienda } from "../lib/store-tienda";
import { EditorTienda } from "../components/editor-tienda";

export default async function PrivadasPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const cotizaciones = await listTienda();
  return <EditorTienda initialCotizaciones={cotizaciones} />;
}
