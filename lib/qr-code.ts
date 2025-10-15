import QRCode from 'qrcode';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const QR_CODE_CACHE_DIR = join(process.cwd(), 'public', 'qr-codes');

// Ensure QR code cache directory exists
async function ensureQrCodeDir() {
  if (!existsSync(QR_CODE_CACHE_DIR)) {
    await mkdir(QR_CODE_CACHE_DIR, { recursive: true });
  }
}

export async function generateQRCode(url: string, filename: string): Promise<string> {
  await ensureQrCodeDir();
  
  const filePath = join(QR_CODE_CACHE_DIR, `${filename}.png`);
  
  // Check if QR code already exists
  if (existsSync(filePath)) {
    return `/qr-codes/${filename}.png`;
  }
  
  try {
    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Save to file
    await writeFile(filePath, qrCodeBuffer);
    
    return `/qr-codes/${filename}.png`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export function generateQRCodeFilename(affiliateId: string, eventId?: string): string {
  const timestamp = Date.now();
  if (eventId) {
    return `event-${eventId}-affiliate-${affiliateId}-${timestamp}`;
  }
  return `affiliate-${affiliateId}-${timestamp}`;
}

