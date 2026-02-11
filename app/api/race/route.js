import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { sentences } from '../../constants/sentences';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new race room
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to create a race' },
        { status: 401 }
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

    const roomCode = generateRoomCode();
    const sentenceId = Math.floor(Math.random() * sentences.length);
    
    const race = await prisma.race.create({
      data: {
        roomCode,
        sentenceId,
        creatorId: user.id,
        participants: {
          create: {
            userId: user.id
          }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            image: true
          }
        },
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

    return NextResponse.json(race);
  } catch (error) {
    console.error('Race creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create race', details: error.message },
      { status: 500 }
    );
  }
}

// Get race details
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomCode = searchParams.get('roomCode');

    if (!roomCode) {
      return NextResponse.json(
        { error: 'Room code is required' },
        { status: 400 }
      );
    }

    const race = await prisma.race.findUnique({
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
        },
        creator: {
          select: {
            id: true,
            username: true,
            image: true
          }
        }
      }
    });

    if (!race) {
      return NextResponse.json(
        { error: 'Race not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(race);
  } catch (error) {
    console.error('Race fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch race', details: error.message },
      { status: 500 }
    );
  }
}
