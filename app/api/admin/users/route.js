import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        gender: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const stats = {
      totalUsers: users.length,
      students: users.filter((u) => u.role === 'student').length,
      teachers: users.filter((u) => u.role === 'teacher').length,
      admins: users.filter((u) => u.role === 'admin').length,
    };

    return NextResponse.json({ users, stats });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
