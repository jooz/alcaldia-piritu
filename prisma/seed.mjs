import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Ventanas del sistema (catálogo del menú)
  const ventanas = [
    { clave: "dashboard", titulo: "Tablero Principal", orden: 1 },
    { clave: "usuarios", titulo: "Usuarios", orden: 2 },
    { clave: "categories", titulo: "Categorías", orden: 3 },
    { clave: "requirements", titulo: "Recaudos", orden: 4 },
    { clave: "attention-areas", titulo: "Áreas de Atención", orden: 5 },
    { clave: "accesos", titulo: "Accesos", orden: 6 },
    { clave: "solicitudes", titulo: "Solicitudes", orden: 7 },
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

  // Usuario administrador - acceso total a todas las ventanas
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: { tipo_usuario: "admin" },
    create: {
      username: "admin",
      password: bcrypt.hashSync("Admin123!", 10),
      nombre: "Administrador",
      email: "admin@alcaldiapiritu.gob.ve",
      activo: true,
      tipo_usuario: "admin",
    },
  });

  await prisma.userAcceso.deleteMany({ where: { userId: admin.id } });
  for (const vid of ventanaIds) {
    await prisma.userAcceso.create({ data: { userId: admin.id, ventanaId: vid } });
  }

  // Usuario operador - acceso solo al dashboard
  const operador = await prisma.user.upsert({
    where: { username: "operador" },
    update: {},
    create: {
      username: "operador",
      password: bcrypt.hashSync("Operador123!", 10),
      nombre: "Operador",
      email: "operador@alcaldiapiritu.gob.ve",
      activo: true,
    },
  });

  await prisma.userAcceso.deleteMany({ where: { userId: operador.id } });
  const dash = await prisma.ventana.findUnique({ where: { clave: "dashboard" } });
  if (dash) {
    await prisma.userAcceso.create({ data: { userId: operador.id, ventanaId: dash.id } });
  }

  // Usuario TIC - acceso total al sistema (tipo_usuario = tic)
  const tic = await prisma.user.upsert({
    where: { username: "tic" },
    update: { tipo_usuario: "tic" },
    create: {
      username: "tic",
      password: bcrypt.hashSync("Tic123!", 10),
      nombre: "Técnico TIC",
      email: "tic@alcaldiapiritu.gob.ve",
      activo: true,
      tipo_usuario: "tic",
    },
  });

  console.log("Seed completado:");
  console.log("  Ventanas:", ventanas.length);
  console.log("  Usuarios creados: admin (todas las ventanas), operador (solo dashboard), tic (acceso total TIC)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
