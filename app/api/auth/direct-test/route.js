import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔍 [DIRECT_AUTH_TEST] Starting direct auth simulation');

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Step 1: Find user
    console.log('📝 [DIRECT_AUTH_TEST] Step 1: Finding user', email);
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: {
          id: true,
          email: true,
          username: true,
          password: true,
          gender: true,
          role: true,
        },
      });
      console.log('✅ [DIRECT_AUTH_TEST] Step 1 OK - User found:', !!user);
    } catch (e) {
      console.error('❌ [DIRECT_AUTH_TEST] Step 1 FAILED:', e.message);
      return NextResponse.json(
        { error: 'Step 1 failed: ' + e.message },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('⚠️ [DIRECT_AUTH_TEST] User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Step 2: Validate password
    console.log('🔐 [DIRECT_AUTH_TEST] Step 2: Validating password');
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('✅ [DIRECT_AUTH_TEST] Step 2 OK - Password match:', isPasswordValid);
    } catch (e) {
      console.error('❌ [DIRECT_AUTH_TEST] Step 2 FAILED:', e.message);
      return NextResponse.json(
        { error: 'Step 2 failed: ' + e.message },
        { status: 500 }
      );
    }

    if (!isPasswordValid) {
      console.log('⚠️ [DIRECT_AUTH_TEST] Password incorrect');
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Step 3: Create user object like authorize() returns
    console.log('🔨 [DIRECT_AUTH_TEST] Step 3: Building user object');
    const resultUser = {
      id: user.id,
      email: user.email,
      name: user.username || user.email,
      username: user.username,
      gender: user.gender,
      role: user.role || 'student',
    };
    console.log('✅ [DIRECT_AUTH_TEST] Step 3 OK - User object created');

    // Step 4: Simulate JWT encoding
    console.log('🔑 [DIRECT_AUTH_TEST] Step 4: Simulating JWT token creation');
    const token = {
      sub: resultUser.id,
      username: resultUser.username,
      email: resultUser.email,
      role: resultUser.role,
    };
    console.log('✅ [DIRECT_AUTH_TEST] Step 4 OK - Token simulated:', token);

    return NextResponse.json({
      success: true,
      message: 'All steps passed! Auth flow should work.',
      steps: {
        'Step 1 - Database Query': 'PASSED',
        'Step 2 - Password Validation': 'PASSED',
        'Step 3 - User Object': 'PASSED',
        'Step 4 - JWT Token': 'PASSED',
      },
      user: resultUser,
      token: token,
    });
  } catch (error) {
    console.error('🚨 [DIRECT_AUTH_TEST] Uncaught error:', error);
    return NextResponse.json(
      { 
        error: 'Uncaught error',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
