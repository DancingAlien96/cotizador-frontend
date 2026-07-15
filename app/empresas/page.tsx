import { redirect } from "next/navigation";

// Ruta antigua: ahora Empresas vive dentro de /cotizaciones (selector de formato).
export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  redirect(`/cotizaciones?formato=empresas${id ? `&id=${id}` : ""}`);
}
