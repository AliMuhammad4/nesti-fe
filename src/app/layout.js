import "./globals.css";
import "@/components/storefront/firstHomeTypography.css";
import {
  Cormorant_Garamond,
  Inter,
  Poppins,
  Source_Sans_3,
} from "next/font/google";

import Providers from "./providers";
import AppChromeShell from "./AppChromeShell";
import CallTranscriptionConsentModal from "@/components/prochat/calls/CallTranscriptionConsentModal";

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
  title: "Nesti AI - AI Intelligence Platform for Real Estate",
  description: "Transform your real estate business with AI intelligence",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${poppins.variable} ${firstHomeHeadingFont.variable} ${firstHomeBodyFont.variable} flex flex-col min-h-screen`}
      >
        <Providers>
          <AppChromeShell>{children}</AppChromeShell>
          <CallTranscriptionConsentModal />
        </Providers>
      </body>
    </html>
  );
}
