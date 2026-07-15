import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import { apiClientes } from "../lib/api";
import { ClientesAdmin } from "../components/clientes-admin";

export default async function ClientesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const clientes = await apiClientes({});
  return <ClientesAdmin initial={clientes} />;
}
