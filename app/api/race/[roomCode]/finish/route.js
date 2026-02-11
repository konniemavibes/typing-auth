import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Finish race
export async function POST(request, { params }) {
  try {
    const { roomCode } = await params;
    let { wpm, accuracy, rawWpm } = await request.json();
    const session = await getServerSession(authOptions);

    // Normalize accuracy to 0-100 range
    if (accuracy > 100) {
      accuracy = accuracy / 100;
    }
    accuracy = Math.min(100, Math.max(0, accuracy));

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
