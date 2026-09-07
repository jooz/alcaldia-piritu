import { auth } from "@/auth";
import { getVentanasUsuario, getTodasVentanas } from "@/lib/ventanas";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardShell from "./DashboardShell";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { tipo_usuario: true } });

  const [allowed, todasVentanas] = await Promise.all([
    getVentanasUsuario(session.user.id),
    getTodasVentanas(),
  ]);

  return (
    <DashboardShell
      allowed={allowed}
      ventanas={todasVentanas}
      user={session.user}
      tipo_usuario={user?.tipo_usuario || "operador"}
    >
      {children}
    </DashboardShell>
  );
}
