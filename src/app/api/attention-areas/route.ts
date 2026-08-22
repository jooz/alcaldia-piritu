import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const areas = await prisma.attentionArea.findMany({
      orderBy: { id: 'asc' },
      include: {
        visitors: true,
      },
    });
    return NextResponse.json(areas);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching attention areas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const area = await prisma.attentionArea.create({
      data: {
        name: body.name,
        description: body.description,
        active: body.active ?? true,
      },
    });
    return NextResponse.json(area);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating attention area' }, { status: 500 });
  }
}