import { auth } from "@/auth";
import { getVentanasUsuario, getTodasVentanas } from "@/lib/ventanas";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const [allowed, todasVentanas] = await Promise.all([
    getVentanasUsuario(session.user.id),
    getTodasVentanas(),
  ]);

  return (
    <DashboardShell allowed={allowed} ventanas={todasVentanas} user={session.user}>
      {children}
    </DashboardShell>
  );
}