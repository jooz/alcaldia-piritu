import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const visitor = await prisma.visitor.update({
      where: { id: Number(id) },
      data: body,
    });
    return NextResponse.json(visitor);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating visitor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.visitor.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Visitor deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting visitor' }, { status: 500 });
  }
}