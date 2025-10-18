import { db } from '@/db';
import { 
  affiliates, 
  affiliateLinks, 
  affiliateCommissions
} from '@/db';
import { and, eq, inArray, sql } from 'drizzle-orm';

export interface AffiliateData {
  aff: {
    id: string;
    userId: string;
    code: string;
    name: string;
    email: string;
    phone: string | null;
    isActive: boolean;
    commissionRate: string;
    totalEarnings: string;
    totalReferrals: number;
    createdAt: Date;
    updatedAt: Date;
  };
  brands: Array<{
    ventureId: string;
    name: string;
    logoUrl: string | null;
    slug: string | null;
  }>;
  links: Array<{
    id: string;
    code: string;
    urlPath: string | null;
    active: boolean;
    ventureId: string;
    eventId: string | null;
    qrCodeUrl: string | null;
    clicks: number | null;
    conversions: number | null;
    eventTitle?: string;
  }>;
}

export interface DashboardStats {
  visitsTotal: number;
  conversionsTotal: number;
  conversionRate: number;
}

export async function getAffiliateByUserId(userId: string): Promise<AffiliateData | null> {
  const [aff] = await db
    .select({
      id: affiliates.id,
      userId: affiliates.userId,
      code: affiliates.code,
      name: affiliates.name,
      email: affiliates.email,
      phone: affiliates.phone,
      isActive: affiliates.isActive,
      commissionRate: affiliates.commissionRate,
      totalEarnings: affiliates.totalEarnings,
      totalReferrals: affiliates.totalReferrals,
      createdAt: affiliates.createdAt,
      updatedAt: affiliates.updatedAt
    })
    .from(affiliates)
    .where(eq(affiliates.userId, userId))
    .limit(1);

  if (!aff) return null;

  // Get brands - for now return empty array since we don't have ventures in our simplified schema
  const brands: Array<{
    ventureId: string;
    name: string;
    logoUrl: string | null;
    slug: string | null;
  }> = [];

  const links = await db
    .select()
    .from(affiliateLinks)
    .where(eq(affiliateLinks.affiliateId, aff.id));

  // Map the database fields to the expected interface
  const mappedLinks = links.map(link => ({
    id: link.id,
    code: link.linkCode,
    urlPath: link.originalUrl,
    active: link.isActive,
    ventureId: link.ventureId,
    eventId: link.eventId,
    qrCodeUrl: link.qrCodeUrl,
    clicks: link.clicks,
    conversions: link.conversions
  }));

  return { aff, brands, links: mappedLinks };
}

export async function getAffiliateLinks(affiliateId: string) {
  return await db
    .select()
    .from(affiliateLinks)
    .where(eq(affiliateLinks.affiliateId, affiliateId));
}

export async function getDashboardStats(affiliateId: string): Promise<DashboardStats> {
  const links = await db
    .select({ id: affiliateLinks.id })
    .from(affiliateLinks)
    .where(eq(affiliateLinks.affiliateId, affiliateId));

  const linkIds = links.map(l => l.id);
  if (!linkIds.length) {
    return { visitsTotal: 0, conversionsTotal: 0, conversionRate: 0 };
  }

  // Get total clicks from affiliate links
  const [{ clicks: visitsTotal }] = await db
    .select({ clicks: sql<number>`sum(${affiliateLinks.clicks})` })
    .from(affiliateLinks)
    .where(inArray(affiliateLinks.id, linkIds));

  // Get total conversions from affiliate links
  const [{ conversions: conversionsTotal }] = await db
    .select({ conversions: sql<number>`sum(${affiliateLinks.conversions})` })
    .from(affiliateLinks)
    .where(inArray(affiliateLinks.id, linkIds));

  const v = Number(visitsTotal ?? 0);
  const c = Number(conversionsTotal ?? 0);
  
  return { 
    visitsTotal: v, 
    conversionsTotal: c, 
    conversionRate: v ? (c / v) * 100 : 0 
  };
}

export function generateReferralLink(code: string, urlPath?: string | null): string {
  const baseUrl = process.env.TALAASH_PUBLIC_BASE_URL || 'https://talaash.thejaayveeworld.com';
  
  if (urlPath) {
    return `${baseUrl}${urlPath}?ref=${code}`;
  }
  
  return `${baseUrl}/r/${code}`;
}
