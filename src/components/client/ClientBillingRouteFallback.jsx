"use client";

import { Loader2 } from "lucide-react";

export default function ClientBillingRouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary sm:h-12 sm:w-12" />
        <p className="mt-4 text-sm text-gray-600 sm:text-base">Loading subscription...</p>
      </div>
    </div>
  );
}
