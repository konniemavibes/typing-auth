import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 [AUTH_TEST] Testing credentials:', { email });

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Test database connection
    console.log('📊 [AUTH_TEST] Testing database...');
    const userCount = await prisma.user.count();
    console.log(`📊 [AUTH_TEST] Database OK - ${userCount} users found`);

    // Try to find user
    console.log('🔍 [AUTH_TEST] Looking for user:', email);
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
      },
    });

    if (!user) {
      console.log('❌ [AUTH_TEST] User not found:', email);
      return NextResponse.json(
        { 
          error: 'User not found',
          tested_email: email,
          hint: 'Make sure the email is registered'
        },
        { status: 401 }
      );
    }

    console.log('✅ [AUTH_TEST] User found:', { id: user.id, email: user.email });

    if (!user.password) {
      console.log('❌ [AUTH_TEST] User has no password');
      return NextResponse.json(
        { error: 'User has no password set' },
        { status: 401 }
      );
    }

    // Test bcrypt
    console.log('🔐 [AUTH_TEST] Testing password...');
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log('❌ [AUTH_TEST] Password incorrect');
      return NextResponse.json(
        { 
          error: 'Invalid password',
          tested_email: email
        },
        { status: 401 }
      );
    }

    console.log('✅ [AUTH_TEST] Password correct! Login should work');
    return NextResponse.json({
      success: true,
      message: 'Credentials are valid!',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('🚨 [AUTH_TEST] Error:', error.message);
    return NextResponse.json(
      { 
        error: 'Test failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
