import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db, affiliateLinks } from '@/db';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { user, affiliate } = await requireAuth();
    
    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate access required' }, { status: 403 });
    }
    
    const { ventureId, urlPath } = await req.json();

    if (!ventureId) {
      return NextResponse.json({ error: 'Venture ID is required' }, { status: 400 });
    }

    // Generate a random code
    const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const [newLink] = await db
      .insert(affiliateLinks)
      .values({
        affiliateId: affiliate.id,
        ventureId,
        linkCode: code,
        originalUrl: urlPath || '',
        isActive: true,
      })
      .returning();

    return NextResponse.json({ link: newLink });
  } catch (error) {
    console.error('Error creating affiliate link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { affiliate } = await requireAuth();
    
    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate access required' }, { status: 403 });
    }
    
    const links = await db
      .select()
      .from(affiliateLinks)
      .where(eq(affiliateLinks.affiliateId, affiliate.id));

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching affiliate links:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
