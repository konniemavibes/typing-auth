import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error('❌ [ADMIN_API] No session found');
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    console.log('🔐 [ADMIN_API] Session user:', {
      id: session.user?.id,
      email: session.user?.email,
      role: session.user?.role,
    });

    if (session.user.role !== 'admin') {
      console.error('❌ [ADMIN_API] User is not admin. Role:', session.user.role);
      return NextResponse.json(
        { error: `Unauthorized - Admin access required (Current role: ${session.user.role})` },
        { status: 403 }
      );
    }

    console.log('✅ [ADMIN_API] Admin user accessing users list');

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
    console.error('❌ [ADMIN_API] Error fetching users:', error);
    return NextResponse.json(
      { error: `Failed to fetch users: ${error.message}` },
      { status: 500 }
    );
  }
}
