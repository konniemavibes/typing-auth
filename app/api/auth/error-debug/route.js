import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Log the request URL for debugging
  const url = new URL(request.url);
  const error = url.searchParams.get('error');
  
  console.log('🔍 [AUTH_ERROR_PAGE] Error page visited:', {
    error,
    url: url.toString(),
    timestamp: new Date().toISOString(),
  });

  try {
    const session = await getServerSession(authOptions);

    return NextResponse.json({
      status: 'Auth Error Page Debug',
      error: error || 'No error parameter provided',
      session: session ? { user: session.user.email } : null,
      url: url.toString(),
      providers: authOptions.providers?.map(p => p.id || p.name) || [],
      environment: {
        nextauth_url: process.env.NEXTAUTH_URL ? '✓ Set' : '✗ Missing',
        nextauth_secret: process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug endpoint error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
