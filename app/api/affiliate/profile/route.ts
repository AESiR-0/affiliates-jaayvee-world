import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { affiliates } from '@/db';
import { eq } from 'drizzle-orm';

// GET affiliate profile by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliateId');
    const affiliateCode = searchParams.get('code');

    if (!affiliateId && !affiliateCode) {
      return NextResponse.json(
        { error: 'Affiliate ID or code is required' },
        { status: 400 }
      );
    }

    let query;
    if (affiliateId) {
      query = eq(affiliates.id, affiliateId);
    } else {
      query = eq(affiliates.code, affiliateCode);
    }

    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(query)
      .limit(1);

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: affiliate.id,
        code: affiliate.code,
        name: affiliate.name,
        email: affiliate.email,
        phone: affiliate.phone,
        commissionRate: affiliate.commissionRate,
        totalEarnings: affiliate.totalEarnings,
        totalReferrals: affiliate.totalReferrals,
        isActive: affiliate.isActive,
        createdAt: affiliate.createdAt,
        updatedAt: affiliate.updatedAt,
      }
    });

  } catch (error) {
    console.error('Get affiliate error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate data' },
      { status: 500 }
    );
  }
}

// UPDATE affiliate profile
export async function PUT(request: NextRequest) {
  try {
    const { affiliateId, name, phone, commissionRate } = await request.json();

    if (!affiliateId) {
      return NextResponse.json(
        { error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    // Check if affiliate exists
    const [existingAffiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.id, affiliateId))
      .limit(1);

    if (!existingAffiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // Update affiliate data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    if (commissionRate) {
      const rate = parseFloat(commissionRate);
      if (rate >= 0 && rate <= 100) {
        updateData.commissionRate = rate.toFixed(2);
      } else {
        return NextResponse.json(
          { error: 'Commission rate must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    const [updatedAffiliate] = await db
      .update(affiliates)
      .set(updateData)
      .where(eq(affiliates.id, affiliateId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Affiliate profile updated successfully',
      data: {
        id: updatedAffiliate.id,
        code: updatedAffiliate.code,
        name: updatedAffiliate.name,
        email: updatedAffiliate.email,
        phone: updatedAffiliate.phone,
        commissionRate: updatedAffiliate.commissionRate,
        totalEarnings: updatedAffiliate.totalEarnings,
        totalReferrals: updatedAffiliate.totalReferrals,
        isActive: updatedAffiliate.isActive,
        updatedAt: updatedAffiliate.updatedAt,
      }
    });

  } catch (error) {
    console.error('Update affiliate error:', error);
    return NextResponse.json(
      { error: 'Failed to update affiliate profile' },
      { status: 500 }
    );
  }
}

// DEACTIVATE affiliate account
export async function DELETE(request: NextRequest) {
  try {
    const { affiliateId } = await request.json();

    if (!affiliateId) {
      return NextResponse.json(
        { error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    // Check if affiliate exists
    const [existingAffiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.id, affiliateId))
      .limit(1);

    if (!existingAffiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // Deactivate affiliate (soft delete)
    const [deactivatedAffiliate] = await db
      .update(affiliates)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(affiliates.id, affiliateId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Affiliate account deactivated successfully',
      data: {
        id: deactivatedAffiliate.id,
        code: deactivatedAffiliate.code,
        isActive: deactivatedAffiliate.isActive,
        deactivatedAt: deactivatedAffiliate.updatedAt,
      }
    });

  } catch (error) {
    console.error('Deactivate affiliate error:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate affiliate account' },
      { status: 500 }
    );
  }
}
