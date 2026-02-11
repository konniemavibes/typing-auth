import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    let { wpm, accuracy, rawWpm, userId } = await request.json();

    // Normalize accuracy to 0-100 range
    if (accuracy > 100) {
      accuracy = accuracy / 100;
    }
    accuracy = Math.min(100, Math.max(0, accuracy));

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
    console.log('GET /api/scores - Starting');
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender');
    const userId = searchParams.get('userId');
    
    console.log('Query params:', { gender, userId });

    let scores = [];

    try {
      if (userId) {
        console.log('Fetching scores for user:', userId);
        scores = await prisma.score.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
        console.log('User scores found:', scores.length);
      } else {
        console.log('Fetching all scores for leaderboard');
        const allScores = await prisma.score.findMany({
          orderBy: { wpm: 'desc' },
          take: 200,
        });
        console.log('Total scores found:', allScores.length);
        
        // Fetch and attach user data
        scores = await Promise.all(allScores.map(async (score) => {
          try {
            if (score.userId) {
              const user = await prisma.user.findUnique({
                where: { id: score.userId },
                select: {
                  username: true,
                  gender: true,
                  image: true,
                }
              });
              return {
                ...score,
                user: user
              };
            }
            return score;
          } catch (err) {
            console.error('Error fetching user:', err);
            return score;
          }
        }));

        if (gender && gender.toLowerCase() !== 'all') {
          console.log('Filtering by gender:', gender);
          scores = scores.filter(score => 
            score.user?.gender?.toLowerCase() === gender.toLowerCase()
          );
          console.log('Scores after gender filter:', scores.length);
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Returning scores:', scores.length);
    return NextResponse.json({ data: scores }, { status: 200 });
  } catch (error) {
    console.error('Score fetch error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to fetch scores', details: error.message },
      { status: 500 }
    );
  }
}
