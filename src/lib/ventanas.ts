import { prisma } from "@/lib/prisma";

/**
 * Devuelve la lista de claves de ventanas a las que tiene acceso el usuario.
 * Si el usuario no existe en BD (login fijo de prueba), devuelve todas.
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

/**
 * Lista de ventanas del sistema con su clave y meta (para el catálogo admin).
 * @deprecated Usar getTodasVentanas() en su lugar.
 */
export const VENTANAS_SISTEMA = [
  { clave: "dashboard", titulo: "Dashboard", orden: 1 },
  { clave: "usuarios", titulo: "Usuarios", orden: 2 },
  { clave: "accesos", titulo: "Accesos", orden: 3 },
  { clave: "typography", titulo: "Typography", orden: 4 },
  { clave: "shadow", titulo: "Shadow", orden: 5 },
  { clave: "icons", titulo: "Icons", orden: 6 },
  { clave: "sample-page", titulo: "Sample Page", orden: 7 },
];