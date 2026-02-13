import { NextResponse } from 'next/server';
import { signIn } from 'next-auth/react';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log('🧪 [TEST_SIGNIN] Testing credentials signin');
    console.log('📧 Email:', email);

    return NextResponse.json({
      message: 'Use signIn() from client side instead',
      hint: 'POST to /api/auth/callback/credentials with email and password'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
