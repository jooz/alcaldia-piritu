import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    const requirement = await prisma.requirement.update({
      where: { id: Number(id) },
      data: data,
    });
    return NextResponse.json(requirement);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating requirement' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.requirement.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Requirement deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting requirement' }, { status: 500 });
  }
}
