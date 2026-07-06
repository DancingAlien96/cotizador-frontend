import { redirect } from "next/navigation";
import { getSession } from "../../lib/session";
import { listGuatecompras } from "../../lib/store-guatecompras";
import { EditorGuatecompras } from "../../components/editor-guatecompras";

export default async function CotizacionGuatecomprasPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const cotizaciones = await listGuatecompras();
  return <EditorGuatecompras initialCotizaciones={cotizaciones} />;
}
