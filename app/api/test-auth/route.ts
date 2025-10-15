import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      session: session ? {
        userId: session.userId,
        userType: session.userType,
        roleName: session.roleName,
        hasAffiliate: !!session.affiliateId
      } : null,
      authSecret: process.env.AUTH_SECRET ? 'Set' : 'Not set'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
