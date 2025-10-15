import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, roles, affiliates } from '@/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, phone } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Get affiliates role (assume it exists)
    const [affiliatesRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'affiliates'))
      .limit(1);

    if (!affiliatesRole) {
      return NextResponse.json(
        { error: 'Affiliates role not found. Please contact administrator.' },
        { status: 500 }
      );
    }

    const roleId = affiliatesRole.id;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        fullName,
        phone: phone || null,
        roleId: roleId,
        isActive: true,
      })
      .returning();

    // Create affiliate record
    const affiliateCode = 'AFF' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const [newAffiliate] = await db
      .insert(affiliates)
      .values({
        userId: newUser.id,
        code: affiliateCode,
        name: fullName,
        email: email,
        phone: phone || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        userId: newUser.id,
        affiliateId: newAffiliate.id,
        affiliateCode: affiliateCode,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
