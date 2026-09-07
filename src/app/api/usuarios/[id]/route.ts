import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/usuarios/[id] -> edita nombre/email/activo/password/tipo_usuario
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const userId = Number(id);
  if (!userId) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "no existe" }, { status: 404 });

  // Block deactivation of TIC users
  if (typeof body.activo === "boolean" && !body.activo && user.tipo_usuario === "tic") {
    return NextResponse.json({ error: "No se puede desactivar un usuario TIC" }, { status: 400 });
  }

  // Block deletion of TIC users (handled in DELETE, but also block activo toggle)
  if (typeof body.activo === "boolean" && !body.activo && user.username === "admin") {
    return NextResponse.json({ error: "No se puede desactivar el admin" }, { status: 400 });
  }

  const data: any = {};
  if (typeof body.nombre === "string") {
    if (body.nombre.length > 100 || body.nombre.trim().length === 0) {
      return NextResponse.json({ error: "El nombre es requerido y máximo 100 caracteres" }, { status: 400 });
    }
    data.nombre = body.nombre;
  }
  if (typeof body.email === "string") {
    if (body.email.length > 40) {
      return NextResponse.json({ error: "El correo electrónico no puede exceder 40 caracteres" }, { status: 400 });
    }
    if (body.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "El formato del correo electrónico no es válido" }, { status: 400 });
    }
    data.email = body.email;
  }
  if (typeof body.activo === "boolean") data.activo = body.activo;
  if (typeof body.password === "string" && body.password.length > 0) {
    if (body.password.length < 6 || body.password.length > 15) {
      return NextResponse.json({ error: "La contraseña debe tener entre 6 y 15 caracteres" }, { status: 400 });
    }
    data.password = bcrypt.hashSync(body.password, 10);
  }

  // Block changing tipo_usuario of admin or TIC users
  if (typeof body.tipo_usuario === "string" && body.tipo_usuario !== user.tipo_usuario) {
    if (user.username === "admin") {
      return NextResponse.json({ error: "No se puede cambiar el tipo del administrador principal" }, { status: 400 });
    }
    if (user.tipo_usuario === "tic") {
      return NextResponse.json({ error: "No se puede cambiar el tipo de un usuario TIC" }, { status: 400 });
    }
    const validTipos = ["admin", "tic", "operador"];
    if (!validTipos.includes(body.tipo_usuario)) {
      return NextResponse.json({ error: "Tipo de usuario inválido" }, { status: 400 });
    }
    data.tipo_usuario = body.tipo_usuario;
  }

  const updated = await prisma.user.update({ where: { id: userId }, data });
  return NextResponse.json({ id: updated.id, nombre: updated.nombre, activo: updated.activo, tipo_usuario: updated.tipo_usuario });
}

// DELETE /api/usuarios/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const userId = Number(id);
  if (!userId) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "no existe" }, { status: 404 });
  if (user.username === "admin")
    return NextResponse.json({ error: "No se puede eliminar el admin" }, { status: 400 });
  if (user.tipo_usuario === "tic")
    return NextResponse.json({ error: "No se puede eliminar un usuario TIC" }, { status: 400 });

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
