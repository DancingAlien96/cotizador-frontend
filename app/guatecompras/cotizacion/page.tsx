import { redirect } from "next/navigation";
import { getSession } from "../../lib/session";
import { listGuatecompras } from "../../lib/store-guatecompras";
import { EditorGuatecompras } from "../../components/editor-guatecompras";

export default async function CotizacionGuatecomprasPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const cotizaciones = await listGuatecompras();
  const { id } = await searchParams;
  return (
    <EditorGuatecompras
      initialCotizaciones={cotizaciones}
      initialSelectedId={id}
      userEmail={session.email}
    />
  );
}
