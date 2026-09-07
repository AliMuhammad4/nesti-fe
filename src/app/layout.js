import "./globals.css";
import { Cormorant_Garamond, Inter, Poppins, Source_Sans_3 } from "next/font/google";
import Script from "next/script";

import Providers from "./providers";
import CustomToastContainer from "@/components/ui/ToastContainer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const firstHomeHeadingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-first-home-heading",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["Palatino Linotype", "Palatino", "Georgia", "serif"],
});

const firstHomeBodyFont = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-first-home-body",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

export const metadata = {
  metadataBase: new URL("https://nesti.ca"),
  title: {
    default: "Nesti AI - AI Intelligence Platform for Real Estate",
    template: "%s | Nesti AI",
  },
  description:
    "Transform your real estate business with AI intelligence. Guided nurture, client matching, and automated workflows for agents, mortgage brokers, and lawyers across Canada.",
  keywords: [
    "real estate AI",
    "real estate platform",
    "lead qualification",
    "mortgage broker CRM",
    "real estate lawyer platform",
    "Canada real estate",
    "Nesti AI",
  ],
  authors: [{ name: "Nesti AI Team" }],
  creator: "Nesti AI",
  publisher: "Nesti AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://nesti.ca",
    siteName: "Nesti AI",
    title: "Nesti AI - AI Intelligence Platform for Real Estate",
    description:
      "Transform your real estate business with AI intelligence. Guided nurture, client matching, and automated workflows.",
    images: [
      {
        url: "/logo/logo.png",
        width: 800,
        height: 800,
        alt: "Nesti AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nesti AI - AI Intelligence Platform for Real Estate",
    description:
      "Transform your real estate business with AI intelligence. Guided nurture, client matching, and automated workflows.",
    images: ["/logo/logo.png"],
  },
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
  icons: {
    icon: "/logo/logo.png",
    shortcut: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SJDRCGMMER"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SJDRCGMMER');
          `}
        </Script>
        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "ycm2gdnbw5");
          `}
        </Script>
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${poppins.variable} ${firstHomeHeadingFont.variable} ${firstHomeBodyFont.variable} flex flex-col min-h-screen`}
      >
        <Providers>
          {children}
          <CustomToastContainer />
        </Providers>
      </body>
    </html>
  );
}
