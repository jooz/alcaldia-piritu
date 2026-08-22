import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/usuarios/[id]/accesos -> ventanas permitidas del usuario
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const userId = Number(id);
  if (!userId) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accesos: true },
  });
  if (!user) return NextResponse.json({ error: "no existe" }, { status: 404 });

  return NextResponse.json({ ventanaIds: user.accesos.map((a) => a.ventanaId) });
}

// PUT /api/usuarios/[id]/accesos -> body: { ventanaIds: number[] } (reemplaza todo)
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const userId = Number(id);
  if (!userId) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  const body = await req.json();
  const ventanaIds: number[] = Array.isArray(body?.ventanaIds) ? body.ventanaIds : [];
  if (!ventanaIds.every((n) => Number.isInteger(n)))
    return NextResponse.json({ error: "ventanaIds inválidos" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "no existe" }, { status: 404 });
  if (user.username === "admin")
    return NextResponse.json({ error: "El admin siempre tiene todas las ventanas" }, { status: 400 });

  await prisma.$transaction([
    prisma.userAcceso.deleteMany({ where: { userId } }),
    ...ventanaIds.map((ventanaId) =>
      prisma.userAcceso.create({ data: { userId, ventanaId } }),
    ),
  ]);

  return NextResponse.json({ ok: true, ventanaIds });
}