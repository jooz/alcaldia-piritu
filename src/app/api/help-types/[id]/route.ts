import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await prisma.$queryRawUnsafe(
      `UPDATE tipos_ayuda SET nombre = $1 WHERE id = $2`,
      body.name,
      Number(id)
    );
    const result = await prisma.$queryRawUnsafe(
      `SELECT id, nombre AS name, categoria_solicitud_id AS "categoryId" FROM tipos_ayuda WHERE id = $1`,
      Number(id)
    );
    return NextResponse.json((result as any[])[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating help type' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const requirements = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) AS count FROM tipos_ayuda_requirement WHERE tipo_ayuda_id = $1`,
      Number(id)
    );

    if ((requirements as any[])[0].count > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar: tiene recaudos asociados' },
        { status: 400 }
      );
    }

    await prisma.$queryRawUnsafe(
      `DELETE FROM tipos_ayuda WHERE id = $1`,
      Number(id)
    );
    return NextResponse.json({ message: 'Help type deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting help type' }, { status: 500 });
  }
}
