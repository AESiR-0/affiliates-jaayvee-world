import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { affiliateLinks } from '@/db';
import { generateQRCode, generateQRCodeFilename } from '@/lib/qr-code';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { user, affiliate } = await requireAuth();
    
    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate access required' },
        { status: 403 }
      );
    }

    const { eventId, eventTitle, originalUrl } = await request.json();

    if (!eventId || !originalUrl) {
      return NextResponse.json(
        { error: 'Event ID and original URL are required' },
        { status: 400 }
      );
    }

    // Generate unique link code
    const linkCode = 'AFF' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Generate QR code
    const qrFilename = generateQRCodeFilename(affiliate.id, eventId);
    const qrCodeUrl = await generateQRCode(originalUrl, qrFilename);

    // Create affiliate link record
    const [newLink] = await db
      .insert(affiliateLinks)
      .values({
        affiliateId: affiliate.id,
        ventureId: 'default-venture', // You might want to get this from event
        eventId: eventId,
        linkCode: linkCode,
        originalUrl: originalUrl,
        qrCodeUrl: qrCodeUrl,
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newLink.id,
        linkCode: newLink.linkCode,
        originalUrl: newLink.originalUrl,
        qrCodeUrl: newLink.qrCodeUrl,
        eventId: newLink.eventId,
        clicks: newLink.clicks,
        conversions: newLink.conversions,
      }
    });
  } catch (error) {
    console.error('Generate affiliate link error:', error);
    return NextResponse.json(
      { error: 'Failed to generate affiliate link' },
      { status: 500 }
    );
  }
}

