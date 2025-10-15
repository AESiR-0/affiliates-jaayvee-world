import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, affiliates, roles } from '@/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email with role information
    const [userWithRole] = await db
      .select({
        id: users.id,
        email: users.email,
        password: users.password,
        fullName: users.fullName,
        roleId: users.roleId,
        roleName: roles.name,
        roleLevel: roles.level
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.email, email))
      .limit(1);

    if (!userWithRole) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, userWithRole.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Determine user type and get affiliate record if needed
    let userType: 'affiliate' | 'admin' | 'staff' = 'staff';
    let affiliateId: string | null = null;

        if (userWithRole.roleName === 'admin') {
          userType = 'admin';
        } else if (userWithRole.roleName === 'affiliates') {
          userType = 'affiliate';
      // Find affiliate record for affiliate users
      const [affiliate] = await db
        .select({ id: affiliates.id })
        .from(affiliates)
        .where(eq(affiliates.userId, userWithRole.id))
        .limit(1);

      if (!affiliate) {
        return NextResponse.json(
          { error: 'No affiliate account found for this user' },
          { status: 403 }
        );
      }
      affiliateId = affiliate.id;
    }

    // Create session
    const token = await createSession(userWithRole.id, affiliateId, userWithRole.roleName, userType);

    // Set cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}