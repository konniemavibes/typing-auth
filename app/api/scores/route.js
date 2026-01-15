import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { wpm, accuracy, rawWpm, userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'You must be signed in to save scores' },
        { status: 401 }
      );
    }

    const score = await prisma.score.create({
      data: {
        wpm,
        accuracy,
        rawWpm,
        userId,
      },
      include: {
        user: {
          select: {
            username: true,
            gender: true,
          }
        }
      }
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

// Get leaderboard with gender filter
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender'); // 'male', 'female', or null (all)

    const where = gender ? {
      user: {
        gender: gender
      }
    } : {};

    const scores = await prisma.score.findMany({
      where,
      orderBy: { wpm: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            username: true,
            gender: true,
          }
        }
      }
    });

    return NextResponse.json({ data: scores });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}