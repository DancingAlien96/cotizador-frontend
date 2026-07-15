import { redirect } from "next/navigation";
import { getSession } from "../../lib/session";
import { listCotizaciones } from "../../lib/store";
import { Editor } from "../../components/editor";

export default async function CartaGarantiaPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; desde?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const cotizaciones = await listCotizaciones();
  const { id, desde } = await searchParams;
  return (
    <Editor
      initialCotizaciones={cotizaciones}
      backHref="/guatecompras"
      initialSelectedId={id}
      prefillDesdeCotizacion={desde === "cotizacion"}
      userEmail={session.email}
    />
  );
}
