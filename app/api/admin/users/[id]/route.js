import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error('❌ [ADMIN_API] No session found for PUT');
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      console.error('❌ [ADMIN_API] User is not admin for PUT. Role:', session.user.role);
      return NextResponse.json(
        { error: `Unauthorized - Admin access required (Current role: ${session.user.role})` },
        { status: 403 }
      );
    }

    console.log('✅ [ADMIN_API] Admin user updating user role');

    const { id } = params;
    const { role } = await request.json();

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be student, teacher, or admin' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    console.log('✅ [ADMIN_API] User role updated:', user.id);
    return NextResponse.json(user);
  } catch (error) {
    console.error('❌ [ADMIN_API] Error updating user:', error.message);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: `Failed to update user: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error('❌ [ADMIN_API] No session found for DELETE');
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    console.log('🔐 [ADMIN_API] DELETE session user role:', session.user.role);

    if (session.user.role !== 'admin') {
      console.error('❌ [ADMIN_API] User is not admin for DELETE. Role:', session.user.role);
      return NextResponse.json(
        { error: `Unauthorized - Admin access required (Current role: ${session.user.role})` },
        { status: 403 }
      );
    }

    const { id } = params;

    console.log('✅ [ADMIN_API] Admin user deleting user:', id);

    // Prevent deleting own admin account
    if (id === session.user.id) {
      console.warn('⚠️ [ADMIN_API] Attempted to delete own account');
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists first
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!userToDelete) {
      console.warn('⚠️ [ADMIN_API] User to delete not found:', id);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    console.log('✅ [ADMIN_API] User deleted successfully:', userToDelete.email);
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ [ADMIN_API] Error deleting user:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: `Failed to delete user: ${error.message}` },
      { status: 500 }
    );
  }
}
