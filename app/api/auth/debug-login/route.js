import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = email.trim().toLowerCase();

    console.log('🧪 [DEBUG_LOGIN] Starting test...');
    console.log('📧 Email:', normalizedEmail);
    console.log('🔑 Password length:', password?.length);
    console.log('🗄️  DATABASE_URL set:', !!process.env.DATABASE_URL);

    // Step 1: Test database connection
    console.log('📊 Step 1: Testing database connection...');
    try {
      await prisma.user.findMany({ take: 1 });
      console.log('✅ Database connection OK');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      return NextResponse.json({
        success: false,
        step: 'database_connection',
        error: dbError.message,
      }, { status: 500 });
    }

    // Step 2: Find user
    console.log('🔍 Step 2: Finding user...');
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
          id: true,
          email: true,
          username: true,
          password: true,
          gender: true,
          createdAt: true,
        },
      });
      
      if (!user) {
        console.log('⚠️  User not found');
        return NextResponse.json({
          success: false,
          step: 'user_lookup',
          error: 'User not found',
          email: normalizedEmail,
        }, { status: 401 });
      }

      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        username: user.username,
        hasPassword: !!user.password,
      });
    } catch (dbError) {
      console.error('❌ User lookup failed:', dbError.message);
      return NextResponse.json({
        success: false,
        step: 'user_lookup',
        error: dbError.message,
      }, { status: 500 });
    }

    // Step 3: Verify password
    console.log('🔐 Step 3: Verifying password...');
    if (!user.password) {
      console.error('❌ User has no password');
      return NextResponse.json({
        success: false,
        step: 'password_check',
        error: 'User has no password set',
      }, { status: 401 });
    }

    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        console.log('⚠️  Password mismatch');
        return NextResponse.json({
          success: false,
          step: 'password_verification',
          error: 'Invalid password',
        }, { status: 401 });
      }

      console.log('✅ Password verified');
    } catch (bcryptError) {
      console.error('❌ Bcrypt error:', bcryptError.message);
      return NextResponse.json({
        success: false,
        step: 'password_verification',
        error: bcryptError.message,
      }, { status: 500 });
    }

    // Success
    console.log('✅ Login test successful!');
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      message: 'Login test passed! Credentials are valid.',
    });

  } catch (error) {
    console.error('🚨 Unexpected error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    }, { status: 500 });
  }
}
