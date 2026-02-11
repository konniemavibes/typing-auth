import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Start a race
export async function POST(request, { params }) {
  try {
    const { roomCode } = await params;
    console.log('Start race endpoint called with roomCode:', roomCode);
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    console.log('User found:', user?.id);

    const race = await prisma.race.findUnique({
      where: { roomCode }
    });
    console.log('Race found:', race?.id, race?.status);

    if (!race) {
      return NextResponse.json(
        { error: 'Race not found' },
        { status: 404 }
      );
    }

    if (race.creatorId !== user.id) {
      return NextResponse.json(
        { error: 'Only the creator can start the race' },
        { status: 403 }
      );
    }

    // Check if there are at least 2 participants
    const participants = await prisma.raceParticipant.findMany({
      where: { raceId: race.id }
    });
    console.log('Participants count:', participants.length);

    if (participants.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 participants are required to start the race' },
        { status: 400 }
      );
    }

    console.log('Updating race status to active with countdown 10');
    const updatedRace = await prisma.race.update({
      where: { id: race.id },
      data: {
        status: 'active',
        startTime: new Date(),
        countdown: 10
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true
              }
            }
          }
        }
      }
    });
    console.log('Race updated successfully:', updatedRace);

    // Don't try to decrement countdown server-side in background
    // Client will handle the countdown timing

    return NextResponse.json(updatedRace);
  } catch (error) {
    console.error('Start race error:', error);
    return NextResponse.json(
      { error: 'Failed to start race', details: error.message },
      { status: 500 }
    );
  }
}
