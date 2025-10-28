import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { affiliates } from '@/db';
import { eq } from 'drizzle-orm';

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

// Function to register with jaayvee-world API
async function registerWithJaayveeWorld(userData: any) {
  try {
    const response = await fetch(`${process.env.JAAYVEE_WORLD_API_URL || 'https://talaash.thejaayveeworld.com'}/api/affiliates/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Jaayvee-world registration error:', error);
    throw error;
  }
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

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

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

    // Register with jaayvee-world API
    const registrationData = {
      fullName,
      email,
      password,
      phone: phone || null,
      businessName: businessName || null,
      website: website || null,
      socialMedia: socialMedia || null,
      referralSource: referralSource || null
    };

    const authResult = await registerWithJaayveeWorld(registrationData);
    
    if (!authResult || !authResult.success) {
      return NextResponse.json(
        { error: authResult?.error || 'Registration failed' },
        { status: 400 }
      );
    }

    // Get user data from jaayvee-world response
    const { user, affiliate } = authResult.data;
    
    if (!user || !affiliate) {
      return NextResponse.json(
        { error: 'User or affiliate data not found' },
        { status: 500 }
      );
    }

    // Find affiliate record in local database
    const [localAffiliate] = await db
      .select({ id: affiliates.id })
      .from(affiliates)
      .where(eq(affiliates.userId, user.id))
      .limit(1);

    if (!localAffiliate) {
      return NextResponse.json(
        { error: 'No affiliate account found for this user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Affiliate account created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
        },
        affiliate: {
          id: affiliate.id,
          code: affiliate.code,
        },
      },
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}