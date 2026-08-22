import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Ventanas del sistema (catálogo del menú)
  const ventanas = [
    { clave: "dashboard", titulo: "Dashboard", orden: 1 },
    { clave: "usuarios", titulo: "Usuarios", orden: 2 },
    { clave: "categories", titulo: "Categorías", orden: 3 },
    { clave: "requirements", titulo: "Recaudos", orden: 4 },
    { clave: "attention-areas", titulo: "Áreas de Atención", orden: 5 },
    { clave: "help-requirements", titulo: "Config. Recaudos", orden: 6 },
    { clave: "accesos", titulo: "Accesos", orden: 7 },
    { clave: "typography", titulo: "Typography", orden: 8 },
    { clave: "shadow", titulo: "Shadow", orden: 9 },
    { clave: "icons", titulo: "Icons", orden: 10 },
    { clave: "sample-page", titulo: "Sample Page", orden: 11 },
  ];

  const ventanaIds = [];
  for (const v of ventanas) {
    const row = await prisma.ventana.upsert({
      where: { clave: v.clave },
      update: { titulo: v.titulo, orden: v.orden },
      create: v,
    });
    ventanaIds.push(row.id);
  }

  // Usuario admin por defecto (credenciales fijas de prueba)
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: bcrypt.hashSync("Admin123!", 10),
      nombre: "Administrador",
      email: "admin@alcaldiapiritu.gob.ve",
      activo: true,
    },
  });

  // Admin tiene acceso a todas las ventanas
  await prisma.userAcceso.deleteMany({ where: { userId: admin.id } });
  for (const vid of ventanaIds) {
    await prisma.userAcceso.create({ data: { userId: admin.id, ventanaId: vid } });
  }

  // Usuario demo con acceso limitado
  const demo = await prisma.user.upsert({
    where: { username: "demo" },
    update: {},
    create: {
      username: "demo",
      password: bcrypt.hashSync("Demo123!", 10),
      nombre: "Usuario Demo",
      email: "demo@alcaldiapiritu.gob.ve",
      activo: true,
    },
  });

  // Demo solo ve Dashboard
  await prisma.userAcceso.deleteMany({ where: { userId: demo.id } });
  const dash = await prisma.ventana.findUnique({ where: { clave: "dashboard" } });
  if (dash) {
    await prisma.userAcceso.create({ data: { userId: demo.id, ventanaId: dash.id } });
  }

  console.log("Seed OK:");
  console.log("  Ventanas:", ventanas.map((v) => v.clave).join(", "));
  console.log("  admin / Admin123! (todas las ventanas)");
  console.log("  demo / Demo123! (solo Dashboard)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
