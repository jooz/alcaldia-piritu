import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const helpRequirements = await prisma.helpRequirement.findMany({
      where: { helpTypeId: Number(id) },
      include: {
        requirement: true,
      },
    });
    return NextResponse.json(helpRequirements);
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

    // Delete existing relationships for this helpType
    await prisma.helpRequirement.deleteMany({
      where: { helpTypeId: Number(id) },
    });

    // Create new relationships
    const data = requirementIds.map((requirementId: number) => ({
      helpTypeId: Number(id),
      requirementId,
    }));

    await prisma.helpRequirement.createMany({ data });

    const updated = await prisma.helpRequirement.findMany({
      where: { helpTypeId: Number(id) },
      include: { requirement: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating help requirements' }, { status: 500 });
  }
}