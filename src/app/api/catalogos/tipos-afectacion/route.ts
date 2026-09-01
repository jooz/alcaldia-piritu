import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.$queryRawUnsafe('SELECT id, nombre FROM tipos_afectacion ORDER BY id');
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching tipos afectacion' }, { status: 500 });
  }
}
