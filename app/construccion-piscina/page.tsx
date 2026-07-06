import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import { listPiscina } from "../lib/store-piscina";
import { EditorPiscina } from "../components/editor-piscina";

export default async function ConstruccionPiscinaPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const cotizaciones = await listPiscina();
  return <EditorPiscina initialCotizaciones={cotizaciones} />;
}
