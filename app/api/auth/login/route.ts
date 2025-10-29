import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, affiliates, roles } from '@/db';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth';

  export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-ID',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Function to authenticate with jaayvee-world API
async function authenticateWithJaayveeWorld(email: string, password: string) {
  try {
    const response = await fetch(`${process.env.JAAYVEE_WORLD_API_URL || 'https://talaash.thejaayveeworld.com'}/api/affiliates/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Jaayvee-world authentication error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      const response = NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
      
      // Add CORS headers
      const origin = request.headers.get('origin') || '*';
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      
      return response;
    }

    // Authenticate with jaayvee-world API
    const authResult = await authenticateWithJaayveeWorld(email, password);
    
    if (!authResult || !authResult.success) {
      const response = NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
      
      // Add CORS headers
      const origin = request.headers.get('origin') || '*';
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      
      return response;
    }

    // Get user data from jaayvee-world response
    const { user, affiliate } = authResult.data;
    
    if (!user || !affiliate) {
      const response = NextResponse.json(
        { error: 'User or affiliate data not found' },
        { status: 401 }
      );
      
      // Add CORS headers
      const origin = request.headers.get('origin') || '*';
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      
      return response;
    }

    // Find affiliate record in local database
    const [localAffiliate] = await db
      .select({ id: affiliates.id })
      .from(affiliates)
      .where(eq(affiliates.userId, user.id))
      .limit(1);

    if (!localAffiliate) {
      const response = NextResponse.json(
        { error: 'No affiliate account found for this user' },
        { status: 403 }
      );
      
      // Add CORS headers
      const origin = request.headers.get('origin') || '*';
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      
      return response;
    }

    // Create session
    const token = await createSession(user.id, localAffiliate.id, user.role.name, 'affiliate');

    // Set cookies - both local session and jaayvee-world auth cookie
    const response = NextResponse.json({ success: true });
    
    // Set local session cookie
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    
    console.log('✅ Session cookie set:', {
      httpOnly: true,
      secure: true,
      path: '/',
      hasToken: !!token
    });

    // Set jaayvee-world auth cookie for API calls
    if (authResult.token) {
      response.cookies.set('auth-token', authResult.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        domain: true ? '.thejaayveeworld.com' : undefined,
      });
    }

    // Add CORS headers
    const origin = request.headers.get('origin') || '*';
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
  } catch (error) {
    console.error('Login error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    
    // Add CORS headers to error response
    const origin = request.headers.get('origin') || '*';
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return response;
  }
}