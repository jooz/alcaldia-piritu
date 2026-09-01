import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tiposAyuda = await prisma.$queryRawUnsafe(`
      SELECT 
        ta.id,
        ta.nombre AS name,
        ta.categoria_solicitud_id AS "categoryId",
        COALESCE(
          (SELECT json_agg(json_build_object('requirement', json_build_object('id', r.id, 'name', r.name, 'condition', r.condition, 'requiresValidity', r."requiresValidity", 'validityDays', r."validityDays", 'mandatory', r.mandatory, 'active', r.active)))
           FROM tipos_ayuda_requirement tar
           JOIN "Requirement" r ON r.id = tar.requirement_id
           WHERE tar.tipo_ayuda_id = ta.id),
          '[]'::json
        ) AS requirements
      FROM tipos_ayuda ta
      WHERE ta.categoria_solicitud_id = $1
      ORDER BY ta.id
    `, Number(id));
    return NextResponse.json(tiposAyuda);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching help types' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await prisma.$queryRawUnsafe(
      `INSERT INTO tipos_ayuda (nombre, categoria_solicitud_id) VALUES ($1, $2) RETURNING id, nombre AS name, categoria_solicitud_id AS "categoryId"`,
      body.name,
      Number(id)
    );
    return NextResponse.json((result as any[])[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating help type' }, { status: 500 });
  }
}
