import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/ventanas -> catálogo de ventanas (menú)
export async function GET() {
  const ventanas = await prisma.ventana.findMany({
    orderBy: { orden: "asc" },
  });
  return NextResponse.json(ventanas);
}