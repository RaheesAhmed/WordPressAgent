import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// Enhanced SEO Metadata
export const metadata: Metadata = {
  title: {
    default: "wpAgent - AI-Powered WordPress Management",
    template: "%s | wpAgent",
  },
  description: "Manage your WordPress sites effortlessly with AI. 190+ specialized tools for content, themes, plugins, WooCommerce, SEO, security, and performance optimization through natural language.",
  keywords: [
    "WordPress",
    "WordPress management",
    "AI WordPress",
    "WordPress automation",
    "WooCommerce",
    "WordPress AI assistant",
    "WordPress tools",
    "site management",
    "WordPress SEO",
    "WordPress security",
    "WordPress optimization",
  ],
  authors: [
    {
      name: "Rahees Ahmed",
      url: "https://github.com/RaheesAhmed",
    },
  ],
  creator: "Rahees Ahmed",
  publisher: "wpAgent",
  applicationName: "wpAgent",
  category: "productivity",
  classification: "Business",
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wpagent.com",
    siteName: "wpAgent",
    title: "wpAgent - AI-Powered WordPress Management",
    description: "Manage your WordPress sites effortlessly with AI. 190+ specialized tools for complete WordPress control through natural language conversations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "wpAgent - AI-Powered WordPress Management",
        type: "image/png",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@wpAgent",
    creator: "@RaheesAhmed",
    title: "wpAgent - AI-Powered WordPress Management",
    description: "Manage your WordPress sites effortlessly with AI. 190+ tools for complete WordPress control.",
    images: ["/twitter-card.png"],
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Icons and Manifest
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#FF6D6B" },
    ],
  },
  manifest: "/site.webmanifest",
  
  // Other metadata
  alternates: {
    canonical: "https://wpagent.vercel.app",
  },
  
  // Verification
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "wpAgent",
              "applicationCategory": "BusinessApplication",
              "description": "AI-powered WordPress site management platform with 190+ specialized tools for content, themes, plugins, WooCommerce, and complete site control through natural language.",
              "url": "https://wpagent.com",
              "author": {
                "@type": "Person",
                "name": "Rahees Ahmed",
                "url": "https://github.com/RaheesAhmed"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "operatingSystem": "Web Browser",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "screenshot": "/og-image.png",
              "softwareVersion": "1.0.0",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "ratingCount": "1"
              }
            })
          }}
        />
        
        {/* Microsoft Tile */}
        <meta name="msapplication-TileColor" content="#21759B" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Apple Web App */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="wpAgent" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Performance Hints */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body
        className={`${inter.variable} font-inter antialiased bg-background text-foreground selection:bg-primary/20`}
      >
        {children}
        
        {/* Analytics Script Placeholder */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
