import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requirements = await prisma.$queryRawUnsafe(`
      SELECT 
        tar.id,
        tar.tipo_ayuda_id AS "helpTypeId",
        tar.requirement_id AS "requirementId",
        json_build_object('id', r.id, 'name', r.name, 'condition', r.condition, 'requiresValidity', r."requiresValidity", 'validityDays', r."validityDays", 'mandatory', r.mandatory, 'active', r.active) AS requirement
      FROM tipos_ayuda_requirement tar
      JOIN "Requirement" r ON r.id = tar.requirement_id
      WHERE tar.tipo_ayuda_id = $1
    `, Number(id));
    return NextResponse.json(requirements);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching help requirements' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { requirementIds } = body;

    if (!requirementIds || !Array.isArray(requirementIds)) {
      return NextResponse.json({ error: 'requirementIds array is required' }, { status: 400 });
    }

    // Delete existing relationships
    await prisma.$queryRawUnsafe(
      `DELETE FROM tipos_ayuda_requirement WHERE tipo_ayuda_id = $1`,
      Number(id)
    );

    // Create new relationships
    for (const requirementId of requirementIds) {
      await prisma.$queryRawUnsafe(
        `INSERT INTO tipos_ayuda_requirement (tipo_ayuda_id, requirement_id) VALUES ($1, $2)`,
        Number(id),
        requirementId
      );
    }

    // Return updated list
    const updated = await prisma.$queryRawUnsafe(`
      SELECT 
        tar.id,
        tar.tipo_ayuda_id AS "helpTypeId",
        tar.requirement_id AS "requirementId",
        json_build_object('id', r.id, 'name', r.name, 'condition', r.condition, 'requiresValidity', r."requiresValidity", 'validityDays', r."validityDays", 'mandatory', r.mandatory, 'active', r.active) AS requirement
      FROM tipos_ayuda_requirement tar
      JOIN "Requirement" r ON r.id = tar.requirement_id
      WHERE tar.tipo_ayuda_id = $1
    `, Number(id));

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating help requirements' }, { status: 500 });
  }
}
