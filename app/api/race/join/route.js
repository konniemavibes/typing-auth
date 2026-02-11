import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to join a race' },
        { status: 401 }
      );
    }

    const { roomCode } = await request.json();

    if (!roomCode) {
      return NextResponse.json(
        { error: 'Room code is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const race = await prisma.race.findUnique({
      where: { roomCode }
    });

    if (!race) {
      return NextResponse.json(
        { error: 'Race not found' },
        { status: 404 }
      );
    }

    if (race.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Race has already started' },
        { status: 400 }
      );
    }

    // Check if user already in race
    const existing = await prisma.raceParticipant.findUnique({
      where: {
        raceId_userId: {
          raceId: race.id,
          userId: user.id
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You are already in this race' },
        { status: 400 }
      );
    }

    // Add user to race
    await prisma.raceParticipant.create({
      data: {
        raceId: race.id,
        userId: user.id
      }
    });

    const updatedRace = await prisma.race.findUnique({
      where: { roomCode },
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

    return NextResponse.json(updatedRace);
  } catch (error) {
    console.error('Join race error:', error);
    return NextResponse.json(
      { error: 'Failed to join race', details: error.message },
      { status: 500 }
    );
  }
}
