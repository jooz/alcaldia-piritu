import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { id: _, ...data } = body;

    const requirement = await prisma.requirement.update({
      where: { id: Number(id) },
      data: data,
    });
    return NextResponse.json(requirement);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating requirement' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.requirement.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Requirement deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting requirement' }, { status: 500 });
  }
}
