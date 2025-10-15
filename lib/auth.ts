import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users, roles, affiliates } from '@/db';
import { eq } from 'drizzle-orm';

export interface Session {
  userId: string;
  affiliateId?: string;
  roleName: string;
  userType: 'affiliate' | 'admin' | 'staff';
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    
    return {
      userId: payload.uid as string,
      affiliateId: payload.aid as string | undefined,
      roleName: payload.role as string,
      userType: (payload.userType as 'affiliate' | 'admin' | 'staff') || 'staff',
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<{ user: { id: string }; affiliate?: { id: string } }> {
  const session = await getSession();
  
  if (!session || !session.userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Verify the user still exists
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      throw new Error('Unauthorized');
    }

    // For affiliates, verify affiliate record exists
    if (session.userType === 'affiliate' && session.affiliateId) {
      const [affiliate] = await db
        .select({ id: affiliates.id })
        .from(affiliates)
        .where(eq(affiliates.id, session.affiliateId))
        .limit(1);

      if (!affiliate) {
        throw new Error('Unauthorized');
      }

      return { user, affiliate };
    }

    // For admin/staff, no affiliate record needed
    return { user };
  } catch (error) {
    console.error('requireAuth error:', error);
    throw new Error('Unauthorized');
  }
}

export async function redirectToLogin() {
  const { redirect } = await import('next/navigation');
  redirect('/login');
}

export async function createSession(userId: string, affiliateId: string | null, roleName: string, userType: 'affiliate' | 'admin' | 'staff'): Promise<string> {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
  
  const payload: any = { 
    uid: userId, 
    role: roleName,
    userType: userType
  };
  
  // Only add affiliateId if it exists
  if (affiliateId) {
    payload.aid = affiliateId;
  }
  
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}
