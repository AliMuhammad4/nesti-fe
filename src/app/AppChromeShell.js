"use client";

import { useEffect, useState } from "react";
import AppChrome from "./AppChrome";
import WorkspaceLoader from "@/components/ui/WorkspaceLoader";

export default function AppChromeShell({ children }) {
  const [mounted, setMounted] = useState(false);
  const [isChatbotEmbedRoute, setIsChatbotEmbedRoute] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location?.pathname || "";
      setIsChatbotEmbedRoute(pathname === "/chatbot" || pathname.startsWith("/chatbot/"));
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    if (isChatbotEmbedRoute) {
      return <>{children}</>;
    }
    return (
      <>
        <main
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background-light/90"
          aria-busy="true"
        >
          <WorkspaceLoader
            fullHeight={false}
            className="max-w-none px-4"
            label="Loading workspace..."
            sublabel="Preparing your tools and data"
          />
        </main>
        {children}
      </>
    );
  }

  return <AppChrome>{children}</AppChrome>;
}
