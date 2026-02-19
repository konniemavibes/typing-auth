import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: {
        nextauth_url: process.env.NEXTAUTH_URL,
        nextauth_secret: process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing',
        database_url: process.env.DATABASE_URL ? '✓ Connected' : '✗ Missing',
        node_env: process.env.NODE_ENV,
      },
      nextauth_config: {
        providers_count: authOptions.providers?.length || 0,
        providers_list: authOptions.providers?.map(p => ({
          id: p.id,
          name: p.name,
        })) || [],
        session_strategy: authOptions.session?.strategy,
        has_secret: !!authOptions.secret,
        has_callbacks: {
          session: !!authOptions.callbacks?.session,
          jwt: !!authOptions.callbacks?.jwt,
          signin: !!authOptions.callbacks?.signIn,
        },
      },
    };

    return NextResponse.json(checks);
  } catch (error) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
