'use client';

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  linkUrl: string;
  eventTitle?: string;
}

export default function QRCodeDisplay({ qrCodeUrl, linkUrl, eventTitle }: QRCodeDisplayProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="text-center">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          {eventTitle ? `QR Code for ${eventTitle}` : 'QR Code'}
        </h4>
        <div className="flex justify-center mb-3">
          <img 
            src={qrCodeUrl} 
            alt="QR Code" 
            className="w-32 h-32 border border-gray-300 rounded"
          />
        </div>
        <p className="text-xs text-gray-600 mb-2">Scan to visit:</p>
        <p className="text-xs font-mono text-gray-800 break-all bg-gray-50 p-2 rounded">
          {linkUrl}
        </p>
      </div>
    </div>
  );
}

