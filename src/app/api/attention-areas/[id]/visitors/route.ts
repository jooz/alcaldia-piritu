import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const visitors = await prisma.visitor.findMany({
      where: { areaId: Number(id) },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(visitors);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching visitors' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const visitor = await prisma.visitor.create({
      data: {
        areaId: Number(id),
        name: body.name,
        phone: body.phone,
        active: body.active ?? true,
      },
    });
    return NextResponse.json(visitor);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating visitor' }, { status: 500 });
  }
}