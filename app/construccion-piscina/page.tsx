import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import { listPiscina } from "../lib/store-piscina";
import { EditorPiscina } from "../components/editor-piscina";

export default async function ConstruccionPiscinaPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const cotizaciones = await listPiscina();
  const { id } = await searchParams;
  return (
    <EditorPiscina initialCotizaciones={cotizaciones} initialSelectedId={id} />
  );
}
