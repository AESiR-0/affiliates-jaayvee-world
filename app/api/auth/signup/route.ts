import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, roles, affiliates } from '@/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Enhanced validation function
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  return { isValid: true };
}

function generateAffiliateCode(): string {
  const prefix = 'AFF';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      fullName, 
      email, 
      password, 
      phone, 
      businessName, 
      website, 
      socialMedia, 
      referralSource 
    } = await request.json();

    // Enhanced validation
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    // Email validation
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Name validation
    if (fullName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Full name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Get affiliates role
    const [affiliatesRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'affiliate'))
      .limit(1);

    if (!affiliatesRole) {
      return NextResponse.json(
        { error: 'Affiliates role not found. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique affiliate code
    let affiliateCode = generateAffiliateCode();
    let attempts = 0;
    
    // Ensure affiliate code is unique
    while (attempts < 5) {
      const [existingCode] = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.code, affiliateCode))
        .limit(1);
      
      if (!existingCode) break;
      
      affiliateCode = generateAffiliateCode();
      attempts++;
    }

    if (attempts >= 5) {
      return NextResponse.json(
        { error: 'Unable to generate unique affiliate code. Please try again.' },
        { status: 500 }
      );
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        fullName: fullName.trim(),
        phone: phone?.trim() || null,
        roleId: affiliatesRole.id,
        isActive: true,
      })
      .returning();

    // Create affiliate record with enhanced data
    const [newAffiliate] = await db
      .insert(affiliates)
      .values({
        userId: newUser.id,
        code: affiliateCode,
        name: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        commissionRate: '5.00', // Default 5% commission
        totalEarnings: '0.00',
        totalReferrals: 0,
        isActive: true,
      })
      .returning();

    // Log successful registration
    console.log(`New affiliate registered: ${newAffiliate.code} - ${newUser.email}`);

    return NextResponse.json({
      success: true,
      message: 'Affiliate account created successfully',
      data: {
        userId: newUser.id,
        affiliateId: newAffiliate.id,
        affiliateCode: affiliateCode,
        email: newUser.email,
        name: newUser.fullName,
        commissionRate: '5.00',
        nextSteps: [
          'Check your email for a welcome message',
          'Complete your profile in the dashboard',
          'Start generating affiliate links',
          'Track your earnings and referrals'
        ]
      }
    });

  } catch (error) {
    console.error('Affiliate signup error:', error);
    
    // Handle specific database errors
    if ((error as { code?: string }).code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create affiliate account. Please try again.' },
      { status: 500 }
    );
  }
}
