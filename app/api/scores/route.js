// app/api/scores/route.js (or your route location)

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();

    // Validate the request body
    if (!body.name || !body.wpm || body.accuracy === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a new score in the database
    const score = await prisma.score.create({
      data: {
        name: body.name,
        wpm: parseInt(body.wpm),
        accuracy: parseFloat(body.accuracy),
        rawWpm: body.rawWpm ? parseInt(body.rawWpm) : parseInt(body.wpm),
      },
    });

    return NextResponse.json({ success: true, data: score });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Fetch the top 100 scores, sorted by WPM in descending order
    const scores = await prisma.score.findMany({
      orderBy: {
        wpm: 'desc',
      },
      take: 100,
    });

    return NextResponse.json({ success: true, data: scores });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}