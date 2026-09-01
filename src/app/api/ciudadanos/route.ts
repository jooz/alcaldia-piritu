import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cedula = searchParams.get('cedula');

    if (!cedula) {
      return NextResponse.json({ error: 'Cédula requerida' }, { status: 400 });
    }

    const solicitante = await prisma.$queryRawUnsafe(
      'SELECT * FROM solicitantes WHERE cedula = $1 LIMIT 1',
      cedula
    ) as any[];

    if (solicitante.length > 0) {
      return NextResponse.json({ found: true, solicitante: solicitante[0] });
    }

    return NextResponse.json({ found: false, cedula });
  } catch (error) {
    return NextResponse.json({ error: 'Error buscando ciudadano' }, { status: 500 });
  }
}
