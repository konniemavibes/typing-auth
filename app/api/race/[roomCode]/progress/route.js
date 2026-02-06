import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Update race progress
export async function POST(request, { params }) {
  try {
    const { roomCode } = await params;
    let { progress, accuracy, wpm, rawWpm } = await request.json();
    
    // Normalize accuracy to 0-100 range
    if (accuracy > 100) {
      accuracy = accuracy / 100;
    }
    accuracy = Math.min(100, Math.max(0, accuracy));
    
    console.log(`Progress update for ${roomCode}:`, { progress, accuracy, wpm, rawWpm });
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const race = await prisma.race.findUnique({
      where: { roomCode }
    });

    if (!race) {
      return NextResponse.json(
        { error: 'Race not found' },
        { status: 404 }
      );
    }

    const participant = await prisma.raceParticipant.update({
      where: {
        raceId_userId: {
          raceId: race.id,
          userId: user.id
        }
      },
      data: {
        progress,
        accuracy,
        wpm,
        rawWpm: rawWpm || wpm
      }
    });

    console.log('Progress saved for user:', user.id, 'Progress:', progress);
    return NextResponse.json(participant);
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress', details: error.message },
      { status: 500 }
    );
  }
}
