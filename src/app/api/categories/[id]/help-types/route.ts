import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const helpTypes = await prisma.helpType.findMany({
      where: { categoryId: Number(id) },
      orderBy: { id: 'asc' },
      include: {
        requirements: {
          include: {
            requirement: true,
          },
        },
      },
    });
    return NextResponse.json(helpTypes);
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
    const helpType = await prisma.helpType.create({
      data: {
        categoryId: Number(id),
        name: body.name,
        description: body.description ?? "",
        active: body.active ?? true,
      },
    });
    return NextResponse.json(helpType);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating help type' }, { status: 500 });
  }
}
