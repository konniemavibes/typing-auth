import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { wpm, accuracy, rawWpm, userId } = await request.json();

    console.log('Received score data:', { wpm, accuracy, rawWpm, userId });

    if (!userId) {
      console.log('No userId provided');
      return NextResponse.json(
        { error: 'You must be signed in to save scores' },
        { status: 401 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    console.log('User found:', user ? 'YES' : 'NO', user ? user.email : 'N/A');

    if (!user) {
      console.log('User not found with id:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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
            image: true,
          }
        }
      }
    });

    console.log('Score created successfully:', score);

    return NextResponse.json(score);
  } catch (error) {
    console.error('Score error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to save score', details: error.message },
      { status: 500 }
    );
  }
}

// Get leaderboard with gender and userId filter
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender'); // 'male', 'female', or null (all)
    const userId = searchParams.get('userId'); // Filter by specific user

    const where = {};

    // Add gender filter if provided
    if (gender) {
      where.user = {
        gender: gender
      };
    }

    // Add userId filter if provided
    if (userId) {
      where.userId = userId;
    }

    const scores = await prisma.score.findMany({
      where,
      orderBy: userId ? { createdAt: 'desc' } : { wpm: 'desc' }, // Sort by date for user scores, by wpm for leaderboard
      take: userId ? 50 : 100, // More scores for leaderboard, fewer for user dashboard
      include: {
        user: {
          select: {
            username: true,
            gender: true,
            image: true,
          }
        }
      }
    });

    return NextResponse.json({ data: scores }, { status: 200 });
  } catch (error) {
    console.error('Score fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores', details: error.message },
      { status: 500 }
    );
  }
}
