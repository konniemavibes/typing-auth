import { NextResponse } from 'next/server';

// NextAuth debug logging endpoint
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 [NextAuth Log]:', body);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Log endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to log' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'NextAuth logging endpoint' });
}
