import "./globals.css";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";

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

export const metadata = {
  metadataBase: new URL("https://nesti.ca"),
  title: "Nesti AI - AI Intelligence Platform for Real Estate",
  description: "Transform your real estate business with AI intelligence",
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
        className={`${inter.variable} ${poppins.variable} flex flex-col min-h-screen`}
      >
        <Providers>
          <AppChromeShell>{children}</AppChromeShell>
          <CallTranscriptionConsentModal />
        </Providers>
      </body>
    </html>
  );
}
