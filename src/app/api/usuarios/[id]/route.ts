import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/usuarios/[id] -> edita nombre/email/activo/password
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const userId = Number(id);
  if (!userId) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  const data: any = {};
  if (typeof body.nombre === "string") data.nombre = body.nombre;
  if (typeof body.email === "string") data.email = body.email;
  if (typeof body.activo === "boolean") data.activo = body.activo;
  if (typeof body.password === "string" && body.password.length > 0)
    data.password = bcrypt.hashSync(body.password, 10);

  const user = await prisma.user.update({ where: { id: userId }, data });
  return NextResponse.json({ id: user.id, nombre: user.nombre, activo: user.activo });
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

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}