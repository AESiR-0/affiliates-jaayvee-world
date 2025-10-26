import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { affiliates, affiliateLinks, affiliateCommissions } from '@/db';
import { eq, and, gte, desc } from 'drizzle-orm';

// GET affiliate statistics and analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliateId');
    const period = searchParams.get('period') || '30'; // days

    if (!affiliateId) {
      return NextResponse.json(
        { error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    // Get affiliate basic info
    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.id, affiliateId))
      .limit(1);

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // Calculate date range
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get affiliate links
    const affiliateLinksData = await db
      .select()
      .from(affiliateLinks)
      .where(eq(affiliateLinks.affiliateId, affiliateId));

    // Get commissions for the period
    const commissionsData = await db
      .select()
      .from(affiliateCommissions)
      .where(
        and(
          eq(affiliateCommissions.affiliateId, affiliateId),
          gte(affiliateCommissions.createdAt, startDate)
        )
      )
      .orderBy(desc(affiliateCommissions.createdAt));

    // Calculate statistics
    const totalLinks = affiliateLinksData.length;
    const activeLinks = affiliateLinksData.filter(link => link.isActive).length;
    const totalClicks = affiliateLinksData.reduce((sum, link) => sum + (link.clicks || 0), 0);
    const totalConversions = affiliateLinksData.reduce((sum, link) => sum + (link.conversions || 0), 0);
    
    const totalCommissions = commissionsData.reduce((sum, commission) => {
      return sum + parseFloat(commission.amount || '0');
    }, 0);

    const pendingCommissions = commissionsData
      .filter(commission => commission.status === 'pending')
      .reduce((sum, commission) => {
        return sum + parseFloat(commission.amount || '0');
      }, 0);

    const approvedCommissions = commissionsData
      .filter(commission => commission.status === 'approved')
      .reduce((sum, commission) => {
        return sum + parseFloat(commission.amount || '0');
      }, 0);

    const paidCommissions = commissionsData
      .filter(commission => commission.status === 'paid')
      .reduce((sum, commission) => {
        return sum + parseFloat(commission.amount || '0');
      }, 0);

    // Calculate conversion rate
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : '0.00';

    // Recent activity (last 10 commissions)
    const recentActivity = commissionsData.slice(0, 10).map(commission => ({
      id: commission.id,
      amount: commission.amount,
      status: commission.status,
      description: commission.description,
      createdAt: commission.createdAt,
    }));

    // Top performing links
    const topLinks = affiliateLinksData
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 5)
      .map(link => ({
        id: link.id,
        linkCode: link.linkCode,
        clicks: link.clicks || 0,
        conversions: link.conversions || 0,
        conversionRate: link.clicks > 0 ? ((link.conversions || 0) / link.clicks * 100).toFixed(2) : '0.00',
        isActive: link.isActive,
      }));

    return NextResponse.json({
      success: true,
      data: {
        affiliate: {
          id: affiliate.id,
          code: affiliate.code,
          name: affiliate.name,
          email: affiliate.email,
          commissionRate: affiliate.commissionRate,
          isActive: affiliate.isActive,
          createdAt: affiliate.createdAt,
        },
        statistics: {
          period: `${days} days`,
          totalLinks,
          activeLinks,
          totalClicks,
          totalConversions,
          conversionRate: `${conversionRate}%`,
          totalCommissions: totalCommissions.toFixed(2),
          pendingCommissions: pendingCommissions.toFixed(2),
          approvedCommissions: approvedCommissions.toFixed(2),
          paidCommissions: paidCommissions.toFixed(2),
        },
        recentActivity,
        topLinks,
        summary: {
          averageCommissionPerConversion: totalConversions > 0 ? (totalCommissions / totalConversions).toFixed(2) : '0.00',
          averageClicksPerLink: totalLinks > 0 ? (totalClicks / totalLinks).toFixed(2) : '0.00',
          earningsPerDay: (totalCommissions / days).toFixed(2),
        }
      }
    });

  } catch (error) {
    console.error('Get affiliate statistics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate statistics' },
      { status: 500 }
    );
  }
}
