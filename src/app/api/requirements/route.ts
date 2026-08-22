import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const requirements = await prisma.requirement.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(requirements);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching requirements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requirement = await prisma.requirement.create({
      data: {
        name: body.name,
        condition: body.condition,
        requiresValidity: body.requiresValidity ?? false,
        validityDays: body.validityDays ?? 0,
        mandatory: body.mandatory ?? true,
        active: body.active ?? true,
      },
    });
    return NextResponse.json(requirement);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating requirement' }, { status: 500 });
  }
}
