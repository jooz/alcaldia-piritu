import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// GET /api/usuarios -> lista de usuarios con sus ventanas
export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
    include: {
      accesos: {
        select: { ventana: { select: { clave: true } } },
      },
    },
  });
  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      username: u.username,
      nombre: u.nombre,
      email: u.email,
      activo: u.activo,
      creado: u.creado,
      ventanas: u.accesos.map((a) => a.ventana.clave),
    })),
  );
}

// POST /api/usuarios -> crea usuario {username, nombre, email, password}
export async function POST(req: Request) {
  const body = await req.json();
  const { username, nombre, email, password } = body;

  if (!username || !nombre || !password) {
    return NextResponse.json(
      { error: "username, nombre y password son requeridos" },
      { status: 400 },
    );
  }

  const existe = await prisma.user.findUnique({ where: { username } });
  if (existe) {
    return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      username,
      nombre,
      email: email || null,
      password: bcrypt.hashSync(password, 10),
    },
  });

  return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
}