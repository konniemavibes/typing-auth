import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Try to connect to database
    let dbStatus = 'Unknown';
    let dbError = null;
    try {
      const userCount = await prisma.user.count();
      dbStatus = `Connected (${userCount} users)`;
    } catch (e) {
      dbError = e.message;
      dbStatus = 'Connection Failed';
    }

    return NextResponse.json({
      status: 'DEBUG INFO',
      session: session ? 'Active' : 'No session',
      database: {
        status: dbStatus,
        error: dbError,
      },
      environment: {
        nextauth_url: process.env.NEXTAUTH_URL ? '✓ Set' : '✗ Missing',
        nextauth_secret: process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing',
        database_url: process.env.DATABASE_URL ? '✓ Set' : '✗ Missing',
        node_env: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
