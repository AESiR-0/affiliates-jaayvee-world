import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAffiliateByUserId, getDashboardStats } from '@/lib/affiliates';

export async function GET() {
  try {
    const { user, affiliate } = await requireAuth();
    const data = await getAffiliateByUserId(user.id);
    const stats = await getDashboardStats(affiliate.id);

    if (!data) {
      return NextResponse.json({ error: 'Affiliate data not found' }, { status: 404 });
    }

    return NextResponse.json({
      affiliate: data.aff,
      brands: data.brands,
      links: data.links,
      stats
    });
  } catch (error) {
    console.error('Error fetching affiliate data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
