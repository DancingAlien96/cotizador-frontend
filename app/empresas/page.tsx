import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import { listPrivadas, peekNextNumero } from "../lib/store-privadas";
import { EditorPrivada } from "../components/editor-privada";

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [cotizaciones, siguienteNumero] = await Promise.all([
    listPrivadas(),
    peekNextNumero(),
  ]);
  const { id } = await searchParams;

  return (
    <EditorPrivada
      initialCotizaciones={cotizaciones}
      siguienteNumero={siguienteNumero}
      initialSelectedId={id}
    />
  );
}
