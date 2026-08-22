import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const helpType = await prisma.helpType.update({
      where: { id: Number(id) },
      data: body,
    });
    return NextResponse.json(helpType);
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
    await prisma.helpType.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Help type deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting help type' }, { status: 500 });
  }
}