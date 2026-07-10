import { redirect } from "next/navigation";
import { getSession } from "../../lib/session";
import { listCotizaciones } from "../../lib/store";
import { Editor } from "../../components/editor";

export default async function CartaGarantiaPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const cotizaciones = await listCotizaciones();
  const { id } = await searchParams;
  return (
    <Editor
      initialCotizaciones={cotizaciones}
      backHref="/guatecompras"
      initialSelectedId={id}
      userEmail={session.email}
    />
  );
}
