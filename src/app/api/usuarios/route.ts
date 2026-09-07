import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// GET /api/usuarios -> lista de usuarios con sus ventanas
export async function GET() {
  const [users, allVentanas] = await Promise.all([
    prisma.user.findMany({
      orderBy: { id: "asc" },
      include: {
        accesos: {
          select: { ventana: { select: { titulo: true } } },
        },
      },
    }),
    prisma.ventana.findMany({ orderBy: { orden: "asc" } }),
  ]);

  const allTitles = allVentanas.map((v) => v.titulo);

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      username: u.username,
      nombre: u.nombre,
      email: u.email,
      activo: u.activo,
      tipo_usuario: u.tipo_usuario,
      creado: u.creado,
      ventanas: u.tipo_usuario === "tic" ? allTitles : u.accesos.map((a) => a.ventana.titulo),
    })),
  );
}

// POST /api/usuarios -> crea usuario {username, nombre, email, password, tipo_usuario}
export async function POST(req: Request) {
  const body = await req.json();
  const { username, nombre, email, password, tipo_usuario } = body;

  if (!username || !nombre || !password) {
    return NextResponse.json(
      { error: "username, nombre, email y password son requeridos" },
      { status: 400 },
    );
  }

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    return NextResponse.json(
      { error: "El correo electrónico es obligatorio" },
      { status: 400 },
    );
  }

  if (email.length > 40) {
    return NextResponse.json(
      { error: "El correo electrónico no puede exceder 40 caracteres" },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "El formato del correo electrónico no es válido" },
      { status: 400 },
    );
  }

  if (typeof username !== "string" || username.length > 15 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return NextResponse.json(
      { error: "El usuario debe ser alfanumérico (con guiones bajos) y máximo 15 caracteres" },
      { status: 400 },
    );
  }

  if (typeof nombre !== "string" || nombre.length > 100 || nombre.trim().length === 0) {
    return NextResponse.json(
      { error: "El nombre es requerido y máximo 100 caracteres" },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length < 6 || password.length > 15) {
    return NextResponse.json(
      { error: "La contraseña debe tener entre 6 y 15 caracteres" },
      { status: 400 },
    );
  }

  if (email && typeof email === "string" && email.length > 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "El formato del correo electrónico no es válido" },
        { status: 400 },
      );
    }
  }

  const validTipos = ["admin", "tic", "operador"];
  const tipo = validTipos.includes(tipo_usuario) ? tipo_usuario : "operador";

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
      tipo_usuario: tipo,
    },
  });

  return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
}