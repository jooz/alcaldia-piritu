import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const area = await prisma.attentionArea.update({
      where: { id: Number(id) },
      data: body,
    });
    return NextResponse.json(area);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating attention area' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.attentionArea.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Attention area deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting attention area' }, { status: 500 });
  }
}