import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, wpm, accuracy, rawWpm, userId } = body;

    const score = await prisma.score.create({
      data: {
        name,
        wpm,
        accuracy,
        rawWpm,
        userId: userId || null,
      },
    });

    return NextResponse.json(score);
  } catch (error) {
    console.error('Score error:', error);
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const scores = await prisma.score.findMany({
      orderBy: { wpm: 'desc' },
      take: 100,
    });

    return NextResponse.json({ data: scores });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}