import { prisma } from "@/lib/prisma";

/**
 * Devuelve la lista de claves de ventanas a las que tiene acceso el usuario.
 * Si el usuario es TIC, tiene acceso a todas las ventanas.
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

  // TIC users have all ventanas
  if (user.tipo_usuario === "tic") {
    const allVentanas = await prisma.ventana.findMany();
    return allVentanas.map((v) => v.clave);
  }

  return user.accesos.map((a) => a.ventana.clave);
}

/**
 * Devuelve todas las ventanas del sistema ordenadas.
 */
export async function getTodasVentanas() {
  return prisma.ventana.findMany({ orderBy: { orden: "asc" } });
}
