import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import { apiReporte } from "../lib/api";
import { Reportes } from "../components/reportes";

export default async function ReportesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const reporte = await apiReporte({});
  return <Reportes initial={reporte} />;
}
