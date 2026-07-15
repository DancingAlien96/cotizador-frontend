import { redirect } from "next/navigation";

// Ruta antigua: ahora Tienda vive dentro de /cotizaciones (selector de formato).
export default async function PrivadasPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  redirect(`/cotizaciones?formato=tienda${id ? `&id=${id}` : ""}`);
}
