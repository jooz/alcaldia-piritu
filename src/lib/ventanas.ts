import { prisma } from "@/lib/prisma";

/**
 * Devuelve la lista de claves de ventanas a las que tiene acceso el usuario.
 * Si el usuario no tiene accesos definidos, devuelve lista vacía.
 */
export async function getVentanasUsuario(userId: string): Promise<string[]> {
  const id = Number(userId);
  if (!id) return [];

  const user = await prisma.user.findUnique({
    where: { id },
    include: { accesos: { include: { ventana: true } } },
  });

  if (!user) return [];

  return user.accesos.map((a) => a.ventana.clave);
}

/**
 * Devuelve todas las ventanas del sistema ordenadas.
 */
export async function getTodasVentanas() {
  return prisma.ventana.findMany({ orderBy: { orden: "asc" } });
}
