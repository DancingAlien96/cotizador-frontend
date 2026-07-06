import { redirect } from "next/navigation";
import { getSession } from "../../lib/session";
import { listCotizaciones } from "../../lib/store";
import { Editor } from "../../components/editor";

export default async function CartaGarantiaPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const cotizaciones = await listCotizaciones();
  return <Editor initialCotizaciones={cotizaciones} backHref="/guatecompras" />;
}
