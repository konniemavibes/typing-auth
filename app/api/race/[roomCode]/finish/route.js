import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Finish race
export async function POST(request, { params }) {
  try {
    const { roomCode } = await params;
    const { wpm, accuracy, rawWpm } = await request.json();
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

    const now = new Date();

    const participant = await prisma.raceParticipant.update({
      where: {
        raceId_userId: {
          raceId: race.id,
          userId: user.id
        }
      },
      data: {
        finished: true,
        finishTime: now,
        wpm,
        accuracy,
        rawWpm: rawWpm || wpm
      }
    });

    // Check if all participants finished
    const allParticipants = await prisma.raceParticipant.findMany({
      where: { raceId: race.id }
    });

    const allFinished = allParticipants.every(p => p.finished);

    if (allFinished) {
      await prisma.race.update({
        where: { id: race.id },
        data: {
          status: 'finished',
          endTime: now
        }
      });
    }

    // Get final results
    const results = await prisma.raceParticipant.findMany({
      where: { raceId: race.id },
      include: {
        user: {
          select: { username: true, image: true }
        }
      },
      orderBy: { wpm: 'desc' }
    });

    return NextResponse.json({
      participant,
      results: results.map(r => ({
        userId: r.userId,
        userName: r.user.username,
        userImage: r.user.image,
        wpm: r.wpm,
        accuracy: r.accuracy,
        rawWpm: r.rawWpm,
        finished: r.finished
      }))
    });
  } catch (error) {
    console.error('Finish race error:', error);
    return NextResponse.json(
      { error: 'Failed to finish race', details: error.message },
      { status: 500 }
    );
  }
}
