import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Jaayvee Affiliates - Earn with Every Referral",
    template: "%s | Jaayvee Affiliates"
  },
  description: "Join Jaayvee Affiliates program and earn passive commissions by sharing referral links across platforms. Start earning with every successful referral today.",
  keywords: [
    "affiliate marketing", "referral program", "passive income", "commission", "Jaayvee affiliates",
    "earn money online", "referral links", "affiliate commission", "passive earnings", "referral rewards",
    "affiliate program", "commission based", "referral system", "earning opportunities", "affiliate network"
  ],
  authors: [{ name: "Jaayvee Team", url: "https://thejaayveeworld.com" }],
  creator: "Jaayvee",
  publisher: "Jaayvee",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://affiliates.jaayvee.com',
    siteName: 'Jaayvee Affiliates',
    title: 'Jaayvee Affiliates - Earn with Every Referral',
    description: 'Join Jaayvee Affiliates program and earn passive commissions by sharing referral links across platforms. Start earning with every successful referral today.',
    images: [
      {
        url: '/static/logos/affiliates/affiliates_og.png',
        width: 1200,
        height: 630,
        alt: 'Jaayvee Affiliates - Earn with Every Referral',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jaayvee Affiliates - Earn with Every Referral',
    description: 'Join Jaayvee Affiliates program and earn passive commissions by sharing referral links across platforms.',
    images: ['/static/logos/affiliates/affiliates_twitter.png'],
    creator: '@jaayvee',
  },
  icons: {
    icon: "/static/logos/affiliates/affiliates_fav.png",
    shortcut: "/static/logos/affiliates/affiliates_fav.png",
    apple: "/static/logos/affiliates/affiliates_fav.png",
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://affiliates.jaayvee.com',
  },
  category: 'business',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Jaayvee Affiliates",
              "url": "https://affiliates.jaayvee.com",
              "logo": "https://affiliates.jaayvee.com/static/logos/affiliates/affiliates_logo.png",
              "description": "Join Jaayvee Affiliates program and earn passive commissions by sharing referral links across platforms. Start earning with every successful referral today.",
              "foundingDate": "2024",
              "founders": [
                {
                  "@type": "Person",
                  "name": "Jaayvee Team"
                }
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-XXXXXXXXXX",
                "contactType": "customer service",
                "availableLanguage": ["English", "Hindi"]
              },
              "sameAs": [
                "https://twitter.com/jaayvee",
                "https://linkedin.com/company/jaayvee",
                "https://instagram.com/jaayvee"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN",
                "addressRegion": "Maharashtra",
                "addressLocality": "Mumbai"
              },
              "serviceType": "Affiliate Marketing Platform",
              "areaServed": {
                "@type": "Country",
                "name": "India"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
